import * as vscode from 'vscode';


interface StringKeyJson {
    [key: string]: string;
}

const LINE_COMMENT_HEADER: StringKeyJson = {
	"bat": ":: ",        
	"bibtex": "",        
	"c": "// ",          
	"cpp": "// ",        
	"csharp": "// ",     
	"css": "",           
	"go": "// ",         
	"html": "<!-- ",     
	"ini": "",           
	"java": "// ",       
	"javascript": "// ", 
	"latex": "% ",       
	"lua": "-- ",        
	"makefile": "",      
	"markdown": "",      
	"perl": "# ",        
	"php": "// ",        
	"powershell": "# ",  
	"python": "# ",      
	"r": "# ",           
	"ruby": "# ",        
	"rust": "// ",       
	"shellscript": "# ", 
	"sql": "-- ",        
	"tex": "% ",         
	"typescript": "// ", 
	"xml": "<!-- ",      
	"yaml": "# ",        
};
  
  const BOX_COMMENT_HEADER: StringKeyJson = {
	"bat": "",              
	"bibtex": "",           
	"c": "/* ",             
	"cpp": "/* ",           
	"csharp": "/* ",        
	"css": "/* ",           
	"go": "/* ",            
	"html": "<!-- ",        
	"ini": "",              
	"java": "/* ",          
	"javascript": "/* ",    
	"latex": "\\begin{comment}",
	"lua": "--[[ ",         
	"makefile": "",         
	"markdown": "",         
	"perl": "=pod\n",       
	"php": "/* ",           
	"powershell": "",      
	"python": "",           
	"r": "",                
	"ruby": "=begin\n",     
	"rust": "/* ",          
	"shellscript": ": '",   
	"sql": "/* ",           
	"tex": "\\begin{comment}",
	"typescript": "/* ",    
	"xml": "<!-- ",         
	"yaml": "",            
};
  
  const BOX_COMMENT_FOOTER: StringKeyJson = {
	"bat": "",              
	"bibtex": "",           
	"c": " */",             
	"cpp": " */",           
	"csharp": " */",        
	"css": " */",            
	"go": " */",            
	"html": "-->",          
	"ini": "",              
	"java": " */",          
	"javascript": " */",    
	"latex": "\\end{comment}",
	"lua": "--]]",          
	"makefile": "",         
	"markdown": "",         
	"perl": "=cut",         
	"php": " */",           
	"powershell": "",      
	"python": "",           
	"r": "",                
	"ruby": "=end",         
	"rust": " */",          
	"shellscript": "'",    
	"sql": " */",           
	"tex": "\\end{comment}",
	"typescript": " */",    
	"xml": "-->",          
	"yaml": "",            
};
  

class commentBox{
	private onelineSnippet!: string;
	private boxedSnippet!: string;
	private enableOneline!: boolean;
	private enableBoxed!: boolean;
	private onelineCommentDefinition!: string;
	private boxedCommentDefinitionHorizontal!: string;
	private boxedCommentDefinitionVertical!: string;
	private boxedCommentDefinitionCorner!: string;
	private maxWidth!: number;

	constructor(){
		this.getConfig();
	}

	private getConfig(){
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
		if(!(lang in LINE_COMMENT_HEADER) || !(lang in BOX_COMMENT_HEADER) || !(lang in BOX_COMMENT_FOOTER)){
			return "";
		}

		let out: string = "";

		if(LINE_COMMENT_HEADER[lang] != ""){
			let width: number = this.getStringWidth(comment);
			width += 2;
			width += LINE_COMMENT_HEADER[lang].length;

			let charCount: number = (this.maxWidth - width) / 2;
			if(charCount < 0){
				charCount = 3;
			}

			out += LINE_COMMENT_HEADER[lang];
			for(let i: number = 0; i < charCount; i += this.onelineCommentDefinition.length){
				out += this.onelineCommentDefinition;
			}
			out += " ";
			out += comment;
			out += " ";
			for(let i: number = 0; i < charCount; i += this.onelineCommentDefinition.length){
				out += this.onelineCommentDefinition;
			}
		}else{
			let width: number = this.getStringWidth(comment);
			width += 2;
			width += BOX_COMMENT_HEADER[lang].length;
			width += BOX_COMMENT_FOOTER[lang].length;
			let charCount: number = (this.maxWidth - width) / 2;
			if(charCount < 0){
				charCount = 3;
			}

			out += BOX_COMMENT_HEADER[lang];
			for(let i: number = 0; i < charCount; i += this.onelineCommentDefinition.length){
				out += this.onelineCommentDefinition;
			}
			out += " ";
			out += comment;
			out += " ";
			for(let i: number = 0; i < charCount; i += this.onelineCommentDefinition.length){
				out += this.onelineCommentDefinition;
			}
			out += BOX_COMMENT_FOOTER[lang];
		}

		out += "\n";
		return out;
	}

	generateBoxedCommentString(lang: string, comments: string[]): string{
		if(!(lang in LINE_COMMENT_HEADER) || !(lang in BOX_COMMENT_HEADER) || !(lang in BOX_COMMENT_FOOTER)){
			return "";
		}

		let out: string = "";

		if(BOX_COMMENT_HEADER[lang] != "" && BOX_COMMENT_FOOTER[lang] != ""){
			let width: number = 0;
			for(const comment of comments){
				let tmp: number = this.getStringWidth(comment);
				if(tmp > width){
					width = tmp;
				}
			}

			width += 2;
			width += this.boxedCommentDefinitionVertical.length;
			width += this.boxedCommentDefinitionVertical.length;


			let allWidth: number = this.maxWidth;
			if(width > allWidth){
				allWidth = width;
			}

			out += BOX_COMMENT_HEADER[lang];
			for(let i: number = BOX_COMMENT_HEADER[lang].length; i < (allWidth - this.boxedCommentDefinitionCorner.length); i += this.boxedCommentDefinitionHorizontal.length){
				out += this.boxedCommentDefinitionHorizontal;
			}
			out += this.boxedCommentDefinitionCorner;
			out += "\n";

			for(const comment of comments){
				out += this.boxedCommentDefinitionVertical;
				out += " ";
				out += comment;
				for(let i: number = (comment.length + this.boxedCommentDefinitionVertical.length + 1); i < (allWidth - this.boxedCommentDefinitionVertical.length - 1); ++i){
					out += " ";
				}
				out += " ";
				out += this.boxedCommentDefinitionVertical;
				out += "\n";
			}


			out += this.boxedCommentDefinitionCorner;
			for(let i: number = this.boxedCommentDefinitionCorner.length; i < (allWidth - BOX_COMMENT_FOOTER[lang].length); i += this.boxedCommentDefinitionHorizontal.length){
				out += this.boxedCommentDefinitionHorizontal;
			}
			out += BOX_COMMENT_FOOTER[lang];
			out += "\n";
		}else{
			let width: number = 0;
			for(const comment of comments){
				let tmp: number = this.getStringWidth(comment);
				if(tmp > width){
					width = tmp;
				}
			}

			width += LINE_COMMENT_HEADER[lang].length;
			width += 2;
			width += this.boxedCommentDefinitionVertical.length;
			width += this.boxedCommentDefinitionVertical.length;


			let allWidth: number = this.maxWidth;
			if(width > allWidth){
				allWidth = width;
			}


			out += LINE_COMMENT_HEADER[lang];
			out += this.boxedCommentDefinitionCorner;
			for(let i: number = (LINE_COMMENT_HEADER[lang].length + this.boxedCommentDefinitionCorner.length); i < (allWidth - this.boxedCommentDefinitionCorner.length); i += this.boxedCommentDefinitionHorizontal.length){
				out += this.boxedCommentDefinitionHorizontal;
			}
			out += this.boxedCommentDefinitionCorner;
			out += "\n";


			for(const comment of comments){
				out += LINE_COMMENT_HEADER[lang];
				out += this.boxedCommentDefinitionVertical;
				out += " ";
				out += comment;
				for(let i: number = (LINE_COMMENT_HEADER[lang].length + comment.length + this.boxedCommentDefinitionVertical.length + 1); i < (allWidth - this.boxedCommentDefinitionVertical.length - 1); ++i){
					out += " ";
				}
				out += " ";
				out += this.boxedCommentDefinitionVertical;
				out += "\n";
			}

			out += LINE_COMMENT_HEADER[lang];
			out += this.boxedCommentDefinitionCorner;
			for(let i: number = (LINE_COMMENT_HEADER[lang].length + this.boxedCommentDefinitionCorner.length); i < (allWidth - this.boxedCommentDefinitionCorner.length); i += this.boxedCommentDefinitionHorizontal.length){
				out += this.boxedCommentDefinitionHorizontal;
			}
			out += this.boxedCommentDefinitionCorner;
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
				num += 2;
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


function replaceCommentText(arg: any){
	const editor: vscode.TextEditor = arg.editor;
	const range: vscode.Range = arg.range;
	let text: string = arg.text;
	const startPosition = range.start;
	const indent: number = startPosition.character;
	let indentedText: string = "";

	const lines = text.split("\n");
	for(let i = 0; i < lines.length; ++i){
		if(i != 0){
			indentedText += "\n";
			for(let j = 0; j < indent; ++j){
				indentedText += " ";
			}
		}
		indentedText += lines[i];
	}

	editor.edit(editBuilder => {
		editBuilder.delete(range);
		editBuilder.insert(startPosition, indentedText);
	});
}



export function activate(context: vscode.ExtensionContext) {
	const generator = new commentBox();

	vscode.commands.registerCommand("comment-box.placeGeneratedComment",replaceCommentText);

	const oneLineProvider = vscode.languages.registerCompletionItemProvider(
		{ scheme: 'file'},
		{provideCompletionItems: generator.provideCompletionItems.bind(generator)},
		generator.getOnelineSnippet().substring(generator.getOnelineSnippet().length - 1, generator.getOnelineSnippet().length)
	);

	const boxedProvider = vscode.languages.registerCompletionItemProvider(
		{ scheme: 'file'},
		{provideCompletionItems: generator.provideCompletionItems.bind(generator)},
		generator.getBoxedSnippet().substring(generator.getBoxedSnippet().length - 1, generator.getBoxedSnippet().length)
	);
	
	
	context.subscriptions.push(oneLineProvider);
	context.subscriptions.push(boxedProvider);
}
