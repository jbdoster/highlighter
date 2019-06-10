import * as vscode from 'vscode';
import { PageHighlighter } from './def';
export function activate(context: vscode.ExtensionContext) {
	let highlighter: PageHighlighter = new PageHighlighter();
	let highlightLines = vscode.commands.registerCommand('extension.highlightLines', () => {
		highlighter.highlightSelection(context);
	});
	let highlightFolder = vscode.commands.registerCommand('extension.highlightFolder', () => {
		let workspaceEditor: vscode.WorkspaceEdit = new vscode.WorkspaceEdit();
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
	context.subscriptions.push( 
								highlightLines, 
								highlightFolder, 
								findHighlight, 
								removeHighlight, 
								removeAllHighlights
								);
}
export function deactivate() { }
