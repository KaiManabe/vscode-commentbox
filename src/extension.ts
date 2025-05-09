/* --------------------------------------------------------+
| This file defines main function and utilities.           |
+-------------------------------------------------------- */

// ----------------------- Importing -----------------------
import * as vscode from "vscode";
import {commentBox} from "./commentBox";


// ------------------ Function definitions ------------------
/**
 * ### Replace original string wrapped with snippets with decolated comment string.
 * 
 * - Param `arg` must contain
 * 
 * 		- editor: vscode.TextEditor => current editor
 * 
 * 		- range: vscode.Range	    => range to replace
 * 
 * 		- text: string				=> replaced string
 * 
 * @param arg object
 */
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


/**
 * ### Called on startup
 * 
 * - Register command to replace original comment with decolated comment.
 * 
 * - Register competion items to detect input string wrapped with defined snippets.
 * 
 * - Add event listener of changing config.
 * 
 * @param context 
 */
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


	const disposable = vscode.workspace.onDidChangeConfiguration(event => {
		generator.getConfig();
	});
	
	
	context.subscriptions.push(disposable);
	context.subscriptions.push(oneLineProvider);
	context.subscriptions.push(boxedProvider);
}
