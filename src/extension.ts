import 	{   
	Highlighter, 
	Subscriber, 
	HighlightPositionShift
} 					  from './classes';
import * as constants from './constants';
import * as vscode    from 'vscode';
import { IHighlight } from './types';

export function activate(context: vscode.ExtensionContext) {

	/** CLASSES */
	let highlighter: Highlighter 		 	= new Highlighter();
	let shifter: 	 HighlightPositionShift = new HighlightPositionShift();
	let subscriber:  Subscriber	 		 	= new Subscriber ();

	/** USER COMMANDS */
	let highlightLines = vscode.commands.registerCommand(constants.COMMAND_HIGHLIGHT, 		() => {
		highlighter.highlightSelection(context);
	});
	let findHighlight = vscode.commands.registerCommand(constants.COMMAND_FIND, 			() => {
		highlighter.findHighlight(context);
	});
	let removeHighlight = vscode.commands.registerCommand(constants.COMMAND_REMOVE, 		() => {
		highlighter.removeHighlight(context);
	});
	let removeAllHighlights = vscode.commands.registerCommand(constants.COMMAND_REMOVE_ALL, () => {
		highlighter.removeAllHighlights(context);
	});

	/** EVENT LISTENERS */
	vscode.window.onDidChangeActiveTextEditor((editor: vscode.TextEditor | undefined) => {
		editor ? subscriber.onActiveEditorDidChangeHandler(context, editor, highlighter) : console.log('No changes');
	});
	vscode.workspace.onDidChangeTextDocument((event: vscode.TextDocumentChangeEvent) => {
		shifter.set(context, event);
	});
	vscode.workspace.onDidSaveTextDocument(() => {
		shifter.dispatchChanges(context);
	});

	/** EXTENSION EXPORTS */
	context.subscriptions.push( 
								highlightLines, 
								findHighlight, 
								removeHighlight, 
								removeAllHighlights
								);
}
export function deactivate() { 

}
