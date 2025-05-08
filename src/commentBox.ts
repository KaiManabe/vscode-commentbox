import * as vscode from "vscode"
import {COMMENT_TOKEN_DEFINITIONS} from "./commentTokens";
import { availableMemory } from "process";

export class commentBox{
	private onelineSnippet!: string;
	private boxedSnippet!: string;
	private enableOneline!: boolean;
	private enableBoxed!: boolean;
	private onelineCommentDefinition!: string;
	private boxedCommentDefinitionHorizontal!: string;
	private boxedCommentDefinitionVertical!: string;
	private boxedCommentDefinitionCorner!: string;
	private maxWidth!: number;
	private fullCharWidth!: number;

	constructor(){
		this.getConfig();
	}

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

	public getOnelineSnippet(){
		return this.onelineSnippet;
	}

	public getBoxedSnippet(){
		return this.boxedSnippet;
	}

	generateOnelineCommentString(lang: string, comment: string): string{
		if(!(lang in COMMENT_TOKEN_DEFINITIONS)){
			return "";
		}

		let out: string = "";

		if(COMMENT_TOKEN_DEFINITIONS[lang].lineComment != ""){
			let currentString: string = comment;
			currentString += " ";
			currentString += " ";
			currentString += COMMENT_TOKEN_DEFINITIONS[lang].lineComment;

			let width: number = this.getStringWidth(currentString);

			let charCount: number = (this.maxWidth - width) / 2 / this.getStringWidth(this.onelineCommentDefinition);
			if(charCount < 0){
				charCount = 3;
			}

			out += COMMENT_TOKEN_DEFINITIONS[lang].lineComment;
			for(let i: number = 0; i < charCount; ++i){
				out += this.onelineCommentDefinition;
			}
			out += " ";
			out += comment;
			out += " ";
			for(let i: number = 0; i < charCount; ++i){
				out += this.onelineCommentDefinition;
			}

		}else{
			let currentString: string = comment;
			currentString += " ";
			currentString += " ";
			currentString += COMMENT_TOKEN_DEFINITIONS[lang].blockCommentBegin;
			currentString += COMMENT_TOKEN_DEFINITIONS[lang].blockCommentEnd;

			let width: number = this.getStringWidth(currentString);

			let charCount: number = (this.maxWidth - width) / 2 / this.getStringWidth(this.onelineCommentDefinition);
			if(charCount < 0){
				charCount = 3;
			}

			out += COMMENT_TOKEN_DEFINITIONS[lang].blockCommentBegin;
			for(let i: number = 0; i < charCount; ++i){
				out += this.onelineCommentDefinition;
			}
			out += " ";
			out += comment;
			out += " ";
			for(let i: number = 0; i < charCount; ++i){
				out += this.onelineCommentDefinition;
			}
			out += COMMENT_TOKEN_DEFINITIONS[lang].blockCommentEnd;
		}

		return out;
	}

	generateBoxedCommentString(lang: string, comments: string[]): string{
		if(!(lang in COMMENT_TOKEN_DEFINITIONS)){
			return "";
		}

		let out: string = "";
		let longestRow: string = "";
		let width: number = this.maxWidth;
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
			if(this.getStringWidth(longestRow) > width){
				width = this.getStringWidth(longestRow);
			}
			
			let thisLine: string = "";

			thisLine += COMMENT_TOKEN_DEFINITIONS[lang].blockCommentBegin;
			while(this.getStringWidth(thisLine + this.boxedCommentDefinitionCorner) < width){
				thisLine += this.boxedCommentDefinitionHorizontal;
			}
			thisLine += this.boxedCommentDefinitionCorner;
			thisLine += "\n";
			out += thisLine;


			for(const comment of comments){
				thisLine = "";
				thisLine += this.boxedCommentDefinitionVertical;
				thisLine += " ";
				thisLine += comment;

				while(this.getStringWidth(thisLine + this.boxedCommentDefinitionVertical) < width){
					thisLine += " ";
				}
				thisLine += this.boxedCommentDefinitionVertical;
				thisLine += "\n";
				out += thisLine;	
			}


			thisLine = "";
			thisLine += this.boxedCommentDefinitionCorner;
			while(this.getStringWidth(thisLine + COMMENT_TOKEN_DEFINITIONS[lang].blockCommentEnd) < width){
				thisLine += this.boxedCommentDefinitionHorizontal;
			}
			thisLine += COMMENT_TOKEN_DEFINITIONS[lang].blockCommentEnd;
			thisLine += "\n";
			out += thisLine;
			out += "\n";

		}else if(COMMENT_TOKEN_DEFINITIONS[lang].lineComment != ""){
			longestRow += COMMENT_TOKEN_DEFINITIONS[lang].lineComment;
			if(this.getStringWidth(longestRow) > width){
				width = this.getStringWidth(longestRow);
			}
			
			let thisLine: string = "";

			thisLine += COMMENT_TOKEN_DEFINITIONS[lang].lineComment;
			thisLine += this.boxedCommentDefinitionCorner;
			while(this.getStringWidth(thisLine + this.boxedCommentDefinitionCorner) < width){
				thisLine += this.boxedCommentDefinitionHorizontal;
			}
			thisLine += this.boxedCommentDefinitionCorner;
			thisLine += "\n";
			out += thisLine;


			for(const comment of comments){
				thisLine = "";
				thisLine += COMMENT_TOKEN_DEFINITIONS[lang].lineComment;
				thisLine += this.boxedCommentDefinitionVertical;
				thisLine += " ";
				thisLine += comment;

				while(this.getStringWidth(thisLine + this.boxedCommentDefinitionVertical) < width){
					thisLine += " ";
				}
				thisLine += this.boxedCommentDefinitionVertical;
				thisLine += "\n";
				out += thisLine;	
			}


			thisLine = "";
			thisLine += COMMENT_TOKEN_DEFINITIONS[lang].lineComment;
			thisLine += this.boxedCommentDefinitionCorner;
			while(this.getStringWidth(thisLine + this.boxedCommentDefinitionCorner) < width){
				thisLine += this.boxedCommentDefinitionHorizontal;
			}
			thisLine += this.boxedCommentDefinitionCorner;
			thisLine += "\n";
			out += thisLine;
			out += "\n";
		}

		return out;
	}


	private getStringWidth(str: string): number{
		let num: number = 0;

		for(const c of str){
			if(/^[\x01-\x7E]$/.test(c)){
				num += 1;
			}else{
				num += this.fullCharWidth;
			}
		}

		return num;
	}


	public provideCompletionItems(): vscode.ProviderResult<vscode.CompletionItem[]>{
		const editor = vscode.window.activeTextEditor;
		if(editor == null){
			return undefined;
		}

		const cursor = editor.selection.active;

		if(this.isGeneratingOneline(editor.document, cursor)){
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
		}else if(this.isGeneratingBoxed(editor.document, cursor)){
			const completion = new vscode.CompletionItem("Generate multi-line comment", vscode.CompletionItemKind.Function);
        	completion.insertText = new vscode.SnippetString("");
			
			const range = this.getEditingRange(editor.document, cursor, this.boxedSnippet);
			if(range == null) return undefined;

			const commentText = this.generateBoxedCommentString(editor.document.languageId, this.getCommentFromEditingRange(editor.document, range, this.boxedSnippet).trim().split("\n"));

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

	public isGeneratingOneline(doc: vscode.TextDocument, currentCursor: vscode.Position){
		return this.getEditingRange(doc, currentCursor, this.onelineSnippet) != null;
	}

	public isGeneratingBoxed(doc: vscode.TextDocument, currentCursor: vscode.Position){
		return this.getEditingRange(doc, currentCursor, this.boxedSnippet) != null;
	}

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
				return range;
			}
		}

		return null;
	}

	private getCommentFromEditingRange(doc: vscode.TextDocument, range: vscode.Range, snippet: string): string{
		const targetText = doc.getText(range);
		if (!targetText.startsWith(snippet) || !targetText.endsWith(snippet)) {
			console.error("getCommentFromEditingRange got invalid arguments.");
			return "";
		}

		const commentText = targetText.slice(snippet.length, targetText.length - snippet.length);
		return commentText.trim();
	}
}