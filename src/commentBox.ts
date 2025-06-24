/* ---------------------------------------------------------------------------+
| This file defines `commentBox` class to generate comments on vscode editor. |
+--------------------------------------------------------------------------- */


// ----------------------- Importing -----------------------
import * as vscode from "vscode"
import {COMMENT_TOKEN_DEFINITIONS} from "./commentTokens";


// -------------------- Class definiton --------------------
/**
 * Generates comment-string when user wrapped some string with snippets.
 */
export class commentBox{
	// ------------------- Member definitions -------------------
	private onelineSnippet!: string;						// Snippet to generate one-line comment
	private boxedSnippet!: string;							// Snippet to generate multi-line comment
	private enableOneline!: boolean;						// Allow to generate one-line comment
	private enableBoxed!: boolean;							// Allow to generate multi-line comment
	private onelineCommentDefinition!: string;				// The character constructs horizontal line of one-line comment
	private boxedCommentDefinitionHorizontal!: string;		// The character constructs holizontal line of multi-line comment
	private boxedCommentDefinitionVertical!: string;		// The character constructs vertical line of multi-line comment
	private boxedCommentDefinitionCorner!: string;			// The character constructs corner of multi-line comment
	private maxWidth!: number;								// Maximum width of each line (Expected integer)
	private fullCharWidth!: number;							// The ratio of full-character to half-character


	// --------------- Public method definitions ---------------
	/**
	 * - Get config at first
	 */
	constructor(){
		this.getConfig();
	}

	
	/**
	 * ### Get config from vscode and initialize members.
	 * 
	 * - Invalid values are replaced with default values.
	 */
	public getConfig(){
		const config = vscode.workspace.getConfiguration('commentBox');

		this.enableOneline = config.get<boolean>('enableOneline') ?? false;
		this.enableBoxed = config.get<boolean>('enableBoxed') ?? false;
		this.onelineSnippet = config.get<string>('onelineSnippet') ?? "";
		this.boxedSnippet = config.get<string>('boxedSnippet') ?? "";
		this.onelineCommentDefinition = config.get<string>('onelineCommentDefinition') ?? "-";
		this.boxedCommentDefinitionHorizontal = config.get<string>('boxedCommentDefinition.horizontal') ?? "-";
		this.boxedCommentDefinitionVertical = config.get<string>('boxedCommentDefinition.vertical') ?? "|";
		this.boxedCommentDefinitionCorner = config.get<string>('boxedCommentDefinition.corner') ?? "+";
		this.maxWidth = config.get<number>('width') ?? 50;
		this.fullCharWidth = config.get<number>('fullCharacterWidth') ?? 2.0;

		if(this.onelineSnippet == ""){
			this.enableOneline = false;
		}
		if(this.boxedSnippet == ""){
			this.enableBoxed = false;
		}
	}


	/**
	 * ### Provides completion item to generate and place comment string.
	 * 
	 * - Called when user inputs defined snippet.
	 * 
	 * - If the comment is wrapped with snippets, provides completion item.
	 * 
	 * - It runs command to place generated comment string when selected by user.
	 * 
	 * @returns Completion item to generate and place comment string. (or undefined)
	 */
	public provideCompletionItems(): vscode.ProviderResult<vscode.CompletionItem[]>{
		const EOL = this.getEndOfLine();
		const editor = vscode.window.activeTextEditor;
		if(editor == null){
			return undefined;
		}

		let cursor = editor.selection.active;

		if(cursor.character > 0){
			const prevCursor = new vscode.Position(cursor.line, cursor.character - 1);
			const currentChar = editor.document.getText(new vscode.Range(prevCursor, cursor));
			if(currentChar == " "){
				cursor = prevCursor;
			}
		}

		if(this.isGeneratingOneline(editor.document, cursor) && this.enableOneline){
			const completion = new vscode.CompletionItem("Generate oneline comment", vscode.CompletionItemKind.Function);
        	completion.insertText = new vscode.SnippetString("");
			
			const range = this.getEditingRange(editor.document, cursor, this.onelineSnippet);
			if(range == null) return undefined;

			const commentText = this.generateOnelineCommentString(editor.document.languageId, this.getCommentFromEditingRange(editor.document, range, this.onelineSnippet));

			completion.command = {
				command: "comment-box.placeGeneratedComment",
				title: "Place generated comment",
				arguments: [{
					editor: editor,
					range: range,
					text: commentText
				}]
			};
        	return [completion];
		}else if(this.isGeneratingBoxed(editor.document, cursor) && this.enableBoxed){
			const completion = new vscode.CompletionItem("Generate multi-line comment", vscode.CompletionItemKind.Function);
        	completion.insertText = new vscode.SnippetString("");
			
			const range = this.getEditingRange(editor.document, cursor, this.boxedSnippet);
			if(range == null) return undefined;

			const commentText = this.generateBoxedCommentString(editor.document.languageId, this.getCommentFromEditingRange(editor.document, range, this.boxedSnippet).trim().split(EOL));

			completion.command = {
				command: "comment-box.placeGeneratedComment",
				title: "Place generated comment",
				arguments: [{
					editor: editor,
					range: range,
					text: commentText
				}]
			};
        	return [completion];
		}

		return undefined;
	}


	/**
	 * ### Returns snippet to generate one-line comment
	 * @returns Snippet
	 */
	public getOnelineSnippet(){
		return this.onelineSnippet;
	}


	/**
	 * ### Returns snippet to generate multi-line comment
	 * @returns Snippet
	 */
	public getBoxedSnippet(){
		return this.boxedSnippet;
	}



	// --------------- Private method definitions ---------------
	/**
	 * ### Generates decorated comment string.
	 * 
	 * @param lang Using language
	 * @param comment Original comment
	 * @returns Decorated comment
	 */
	private generateOnelineCommentString(lang: string, comment: string): string{
		if(!(lang in COMMENT_TOKEN_DEFINITIONS)){
			return "";
		}

		// e.g.: []
		let out: string = "";

		if(COMMENT_TOKEN_DEFINITIONS[lang].lineComment != ""){	// If the language has line-comment
			// Calculate the count of horizontal-line character
			let currentString: string = comment;
			currentString += " ";
			currentString += " ";
			currentString += COMMENT_TOKEN_DEFINITIONS[lang].lineComment;

			let width: number = this.getStringWidth(currentString);

			let charCount: number = (this.maxWidth - width) / 2 / this.getStringWidth(this.onelineCommentDefinition);
			if(charCount < 3){
				charCount = 3;
			}

			// e.g.: [// ]
			out += COMMENT_TOKEN_DEFINITIONS[lang].lineComment;

			// e.g.: [// ----------]
			for(let i: number = 0; i < charCount; ++i){
				out += this.onelineCommentDefinition;
			}

			// e.g.: [// ---------- original comment ]
			out += " ";
			out += comment;
			out += " ";

			// e.g.: [// ---------- original comment ----------]
			for(let i: number = 0; i < charCount; ++i){
				out += this.onelineCommentDefinition;
			}


		}else{	// If the language has only block-comment

			// Calculate the count of horizontal-line character
			let currentString: string = comment;
			currentString += " ";
			currentString += " ";
			currentString += COMMENT_TOKEN_DEFINITIONS[lang].blockCommentBegin;
			currentString += COMMENT_TOKEN_DEFINITIONS[lang].blockCommentEnd;

			let width: number = this.getStringWidth(currentString);

			let charCount: number = (this.maxWidth - width) / 2 / this.getStringWidth(this.onelineCommentDefinition);
			if(charCount < 3){
				charCount = 3;
			}

			// e.g.: [/* ]
			out += COMMENT_TOKEN_DEFINITIONS[lang].blockCommentBegin;

			//e.g.: [/* ----------]
			for(let i: number = 0; i < charCount; ++i){
				out += this.onelineCommentDefinition;
			}

			//e.g.: [/* ---------- original comment ]
			out += " ";
			out += comment;
			out += " ";

			//e.g.: [/* ---------- original comment ----------]
			for(let i: number = 0; i < charCount; ++i){
				out += this.onelineCommentDefinition;
			}

			//e.g.: [/* ---------- original comment ---------- */]
			out += COMMENT_TOKEN_DEFINITIONS[lang].blockCommentEnd;
		}

		return out;
	}


	/**
	 * ### Generates decorated comment string.
	 * 
	 * @param lang Using language
	 * @param comments Original comment (array of each lines)
	 * @returns Decorated comment
	 */
	private generateBoxedCommentString(lang: string, comments: string[]): string{
		const EOL = this.getEndOfLine();
		if(!(lang in COMMENT_TOKEN_DEFINITIONS)){
			return "";
		}

		let out: string = "";
		let longestRow: string = "";
		let width: number = this.maxWidth;

		// Calculate maximum width
		for(const comment of comments){
			if(this.getStringWidth(comment) > this.getStringWidth(longestRow)){
				longestRow = comment;
			}
		}
		longestRow += " ";
		longestRow += " ";
		longestRow += this.boxedCommentDefinitionVertical;
		longestRow += this.boxedCommentDefinitionVertical;


		if(COMMENT_TOKEN_DEFINITIONS[lang].blockCommentBegin != "" && COMMENT_TOKEN_DEFINITIONS[lang].blockCommentEnd != ""){
			// If the language has block-comment


			if(this.getStringWidth(longestRow) > width){
				width = this.getStringWidth(longestRow);
			}
			
			// e.g.: []
			let thisLine: string = "";

			// e.g.: [/* ]
			thisLine += COMMENT_TOKEN_DEFINITIONS[lang].blockCommentBegin;

			// e.g.: [/* --------------------]
			while(this.getStringWidth(thisLine + this.boxedCommentDefinitionCorner) < width){
				thisLine += this.boxedCommentDefinitionHorizontal;
			}

			// e.g.: [/* --------------------+]
			thisLine += this.boxedCommentDefinitionCorner;

			thisLine += EOL;
			out += thisLine;

			for(const comment of comments){
				// e.g.: [|]
				thisLine = "";
				thisLine += this.boxedCommentDefinitionVertical;

				// e.g.: [| original comment]
				thisLine += " ";
				thisLine += comment;

				// e.g.: [| original comment              ]
				while(this.getStringWidth(thisLine + this.boxedCommentDefinitionVertical) < width){
					thisLine += " ";
				}

				// e.g.: [| original comment              |]
				thisLine += this.boxedCommentDefinitionVertical;

				thisLine += EOL;
				out += thisLine;	
			}

			// e.g.: [+]
			thisLine = "";
			thisLine += this.boxedCommentDefinitionCorner;

			// e.g.: [+--------------------]
			while(this.getStringWidth(thisLine + COMMENT_TOKEN_DEFINITIONS[lang].blockCommentEnd) < width){
				thisLine += this.boxedCommentDefinitionHorizontal;
			}

			// e.g.: [+--------------------+]
			thisLine += COMMENT_TOKEN_DEFINITIONS[lang].blockCommentEnd;

			thisLine += EOL;
			out += thisLine;
			out += EOL;

		}else if(COMMENT_TOKEN_DEFINITIONS[lang].lineComment != ""){
			// If the language has only line-comment

			// Calculate maximum width
			longestRow += COMMENT_TOKEN_DEFINITIONS[lang].lineComment;
			if(this.getStringWidth(longestRow) > width){
				width = this.getStringWidth(longestRow);
			}
			
			// e.g.: []
			let thisLine: string = "";

			// e.g.: [// ]
			thisLine += COMMENT_TOKEN_DEFINITIONS[lang].lineComment;

			// e.g.: [// +]
			thisLine += this.boxedCommentDefinitionCorner;

			// e.g.: [// +--------------------]
			while(this.getStringWidth(thisLine + this.boxedCommentDefinitionCorner) < width){
				thisLine += this.boxedCommentDefinitionHorizontal;
			}

			// e.g.: [// +--------------------+]
			thisLine += this.boxedCommentDefinitionCorner;

			thisLine += EOL;
			out += thisLine;

			for(const comment of comments){
				// e.g.: []
				thisLine = "";

				// e.g.: [// ]
				thisLine += COMMENT_TOKEN_DEFINITIONS[lang].lineComment;

				// e.g.: [// | ]
				thisLine += this.boxedCommentDefinitionVertical;
				thisLine += " ";

				// e.g.: [// | original comment]
				thisLine += comment;

				// e.g.: [// | original comment          ]
				while(this.getStringWidth(thisLine + this.boxedCommentDefinitionVertical) < width){
					thisLine += " ";
				}

				// e.g.: [// | original comment          |]
				thisLine += this.boxedCommentDefinitionVertical;

				thisLine += EOL;
				out += thisLine;	
			}

			// e.g.: [// ]
			thisLine = "";
			thisLine += COMMENT_TOKEN_DEFINITIONS[lang].lineComment;

			// e.g.: [// +]
			thisLine += this.boxedCommentDefinitionCorner;

			// e.g.: [// +---------------------]
			while(this.getStringWidth(thisLine + this.boxedCommentDefinitionCorner) < width){
				thisLine += this.boxedCommentDefinitionHorizontal;
			}

			// e.g.: [// +---------------------+]
			thisLine += this.boxedCommentDefinitionCorner;

			thisLine += EOL;
			out += thisLine;
			out += EOL;
		}

		return out;
	}


	/**
	 * ### Calculate width of string as half-character
	 * 
	 * @param str original string
	 * @returns Width count as half-charcter
	 */
	private getStringWidth(str: string): number{
		let num: number = 0;

		for(const c of str){
			if(/^[\x01-\x7E]$/.test(c)){	// If it is ASCII character
				num += 1;
			}else{
				num += this.fullCharWidth;
			}
		}

		return num;
	}

	
	/**
	 * ### Get original comment from string wrapped with snippets.
	 * 
	 * - The string specified by `range` param must be wrapped with snippets.
	 * 
	 * @param doc Editing document
	 * @param range The range from first snippet to last snippet
	 * @param snippet Defined snippet
	 * @returns Original comment 
	 */
	private getCommentFromEditingRange(doc: vscode.TextDocument, range: vscode.Range, snippet: string): string{
		const indent = doc.lineAt(range.start.line).firstNonWhitespaceCharacterIndex;
		const indentRange = new vscode.Range(new vscode.Position(range.start.line, 0), new vscode.Position(range.start.line, indent));
		const indentString = doc.getText(indentRange);

		const targetText = doc.getText(range);
		if (!targetText.startsWith(snippet) || !targetText.endsWith(snippet)) {
			console.error("getCommentFromEditingRange got invalid arguments.");
			return "";
		}

		const commentText = targetText.slice(snippet.length, targetText.length - snippet.length).replaceAll("\n" + indentString, "\n");
		return commentText.trim();
	}


	/**
	 * ### Returns true if the user wrapped some string with defined snippets.
	 * 
	 * @param doc Editing document
	 * @param currentCursor Current cursor position
	 * @returns If the user wrapped
	 */
	private isGeneratingOneline(doc: vscode.TextDocument, currentCursor: vscode.Position): boolean{
		return this.getEditingRange(doc, currentCursor, this.onelineSnippet) != null;
	}


	/**
	 * ### Returns true if user wrapped some string with defined snippets.
	 * 
	 * @param doc Editing document
	 * @param currentCursor Current cursor position
	 * @returns If the user wrapped
	 */
	private isGeneratingBoxed(doc: vscode.TextDocument, currentCursor: vscode.Position): boolean{
		return this.getEditingRange(doc, currentCursor, this.boxedSnippet) != null;
	}


	/**
	 * ### Returns the range of wrapped string.
	 * 
	 * - If it is not wrapped with defined snippet, returns null.
	 * 
	 * @param doc Editing document
	 * @param cursor Current cursor position
	 * @param snippet Defined snippet
	 * @returns The range that user wrapped with snippet
	 */
	private getEditingRange(doc: vscode.TextDocument, cursor: vscode.Position, snippet: string): vscode.Range | null{
		const zeroCursor = new vscode.Position(0,0);
		const str = doc.getText(new vscode.Range(zeroCursor, cursor));

		if(str.length < (snippet.length * 2 + 1)){
			return null;
		}

		if(!str.endsWith(snippet)){
			return null;
		}

		for(let i = (str.length - snippet.length); i >= snippet.length; --i){
			if(str.substring(i - snippet.length, i) == snippet){
				const startCursor = doc.positionAt(i - snippet.length);
				const range = new vscode.Range(startCursor, cursor);
				if(!commentBox.isComment(doc, startCursor))	return range;
			}
		}

		return null;
	}
	
	/**
	 * ### Returns is the cursor in comment or not.
	 * @param doc Editing document
	 * @param cursor Examining position
	 * @returns bool
	 */
	private static isComment(doc: vscode.TextDocument, cursor: vscode.Position): boolean{
		const stringBeforeInLine = doc.getText(new vscode.Range(new vscode.Position(cursor.line, 0), cursor));
		if(
			COMMENT_TOKEN_DEFINITIONS[doc.languageId].lineComment != "" &&
			stringBeforeInLine.includes(COMMENT_TOKEN_DEFINITIONS[doc.languageId].lineComment)
		){
			return true;
		}

		const cursorIdx = doc.offsetAt(cursor);
		const blockCommentBegin = COMMENT_TOKEN_DEFINITIONS[doc.languageId].blockCommentBegin;
		const blockCommentEnd = COMMENT_TOKEN_DEFINITIONS[doc.languageId].blockCommentEnd;
		if(blockCommentBegin == "" || blockCommentEnd == "") return false;

		for(let i = cursorIdx; i >= 0; --i){
			let s = doc.getText().substring(i, cursorIdx);
			if(s.includes(blockCommentBegin) && !s.includes(blockCommentEnd)){
				for(let ii = cursorIdx; ii < doc.getText().length; ++ii){
					let ss = doc.getText().substring(cursorIdx, ii);
					if(!ss.includes(blockCommentBegin) && ss.includes(blockCommentEnd)) return true;
				}
			}
		}

		return false;
	}

	
	/**
	 * ### Returns EOL characters of editing document
	 * @returns EOL
	 */
	private getEndOfLine(): string{
		const editor = vscode.window.activeTextEditor;
		if (editor) {
		  const document = editor.document;
		  const eol = document.eol === vscode.EndOfLine.CRLF ? "\r\n" : "\n";
		  return eol;
		}
		return "\n";
	}
}