import * as vscode from 'vscode';
import { Highlighter } from './def';
export function activate(context: vscode.ExtensionContext) {
	let highlighter: Highlighter = new Highlighter();
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
	context.subscriptions.push(highlightLines, findHighlight, removeHighlight, removeAllHighlights);
}
export function deactivate() { }
