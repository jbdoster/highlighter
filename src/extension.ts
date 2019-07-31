import * as vscode from 'vscode';
import { Highlighter, HighlightShiftQueue, Subscriber } from './classes';
export function activate(context: vscode.ExtensionContext) {

	// Classes
	let highlighter: Highlighter 		 = new Highlighter();
	let queue: 		 HighlightShiftQueue = new HighlightShiftQueue();
	let subscriber:  Subscriber	 		 = new Subscriber ();

	// Commands for the user
	let highlightLines = vscode.commands.registerCommand('extension.highlightLines', () => {
		highlighter.highlightSelection(context);
	});
	let findHighlight = vscode.commands.registerCommand('extension.findHighlight', () => {
		highlighter.findHighlight(context);
	});
	let removeHighlight = vscode.commands.registerCommand('extension.removeHighlight', () => {
		highlighter.removeHighlight(context);
	});
	let removeAllHighlights = vscode.commands.registerCommand('extension.removeAllHighlights', () => {
		highlighter.removeAllHighlights(context);
	});
	vscode.window.onDidChangeActiveTextEditor((editor: vscode.TextEditor | undefined) => {
		/** User changed active text file */
		editor ? subscriber.onActiveEditorDidChangeHandler(context, editor, highlighter) : console.log('No changes');
	});
	vscode.workspace.onDidChangeTextDocument((event: vscode.TextDocumentChangeEvent) => {
		/** User made changes in active text file */
		subscriber.onTextDocumentChangedHandler(context, event, highlighter, queue);
	});
	context.subscriptions.push( 
								highlightLines, 
								findHighlight, 
								removeHighlight, 
								removeAllHighlights
								);
}
export function deactivate() { 

}
