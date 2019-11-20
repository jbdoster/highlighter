import * as vscode from 'vscode';
import { Displacement, Highlighter } from './def';
export function activate(context: vscode.ExtensionContext) {

	let displacement: Displacement = new Displacement();
	let highlighter: Highlighter = new Highlighter();

	vscode.workspace.onDidChangeTextDocument(
	(event: vscode.TextDocumentChangeEvent) => {
		if (event) {
			// displacement.enqueue(event);
		}
	});

	let highlightLines = vscode.commands.registerCommand('extension.highlightLines', () => {
		highlighter.highlight_selection(context);
	});

	let highlightFolder = vscode.commands.registerCommand('extension.highlightFolder', () => {
		let workspaceEditor: vscode.WorkspaceEdit = new vscode.WorkspaceEdit();
	});

	let find_highlight = vscode.commands.registerCommand('extension.find_highlight', () => {
		highlighter.find_highlight(context);
	});

	let remove_highlight = vscode.commands.registerCommand('extension.remove_highlight', () => {
		highlighter.remove_highlight(context);
	});

	let remove_all_highlights = vscode.commands.registerCommand('extension.remove_all_highlights', () => {
		highlighter.remove_all_highlights(context);
	});

	context.subscriptions.push( 
								highlightLines, 
								highlightFolder, 
								find_highlight, 
								remove_highlight, 
								remove_all_highlights
	);

}
export function deactivate() { }
