import * as vscode from "vscode";
import {commentBox} from "./commentBox";


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
