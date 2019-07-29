import * as vscode from 'vscode';
import { Highlighter, Subscriber } from './classes';
export function activate(context: vscode.ExtensionContext) {
	let highlighter: Highlighter;
	let subscriber: Subscriber;
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
	vscode.window.onDidChangeActiveTextEditor((event: any) => {
		subscriber.onTextDocumentChangedHandler(context, event);
	});
	vscode.workspace.onDidChangeTextDocument((event: vscode.TextDocumentChangeEvent) => {
		subscriber.onTextDocumentChangedHandler(context, event);
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
