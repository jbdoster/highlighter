import {
	Navigate,
	Present,
	Store,
	Style
} from "./classes";
import { Highlight } from './types';
import { commands, ExtensionContext, TextDocumentChangeEvent, TextEditor, Uri, window, workspace  } from 'vscode';
import {  
	COMMAND_HIGHLIGHT,
	COMMAND_FIND,
	COMMAND_REMOVE,
	COMMAND_REMOVE_ALL,
	Op, 
	NO_SAVED_HIGHLIGHTS} from './constants';

export function activate(context: ExtensionContext) {

	let navigate: Navigate = new Navigate();
	let present:  Present  = new Present();
	let store: 	  Store    = new Store();
	let style: 	  Style    = new Style();

	/** USER COMMANDS */
	let highlightLines = commands.registerCommand(COMMAND_HIGHLIGHT,
		async () => {
		/**
		 *  User calls "Highlight Line(s)""
		 *  1) Get name
		 *  2) Get color
		 *  3) Store
		 */
		let name: string = await present.choose_highlight_name();
		let hex:  string = await present.choose_highlight_color();
		store.save(name, hex, context.globalState);
	});
	let findHighlight = commands.registerCommand(COMMAND_FIND,
		async () => {
		/**
		 *  User calls "Find Highlight"
		 *  1) Get highlight
		 *  2) Navigate to doc
		 *  3) Decorate (?? Do the window events take care of this ??)
		 */
		let highlights: Highlight[] | undefined = await store.get(context.globalState);
		if (!highlights || highlights.length < 1) {
			window.showInformationMessage(NO_SAVED_HIGHLIGHTS);
			return;
		}
 		let choice: Highlight | void = await present.choose_find_highlight(highlights);
		choice ? navigate.go_to(choice) : console.log();
	});
	let removeHighlight = commands.registerCommand(COMMAND_REMOVE,
		async () => {
		/**
		 *  User calls "Remove Highlight"
		 *  1) Get highlight
		 *  2) Modify stored highlights
		 *  3) Store
		 */
		let name: string = await present.choose_highlight_name();
		store.remove(name, context.globalState);
	});
	let removeAllHighlights = commands.registerCommand(COMMAND_REMOVE_ALL, 
		async () => {
		/**
		 *  User calls "Remove All Highlights"
		 *  1) Remove all
		 */
		store.removeAll(context.globalState);
	});

	/** EVENT LISTENERS */
	window.onDidChangeActiveTextEditor((editor: TextEditor | undefined) => {
		/**
		 *  User switched text editor
		 * 	1) Decorate the active text file with saved highlights
		 */
		let highlights: any = store.get(context.globalState);
		for (let i = 0; i < highlights.length; i++) {
			if (editor && highlights[i].uri !== editor.document.uri) {
				delete highlights[i];
			}
		}
		style.decorate(highlights);
	});
	workspace.onDidChangeTextDocument(
		async (event: TextDocumentChangeEvent) => {
		/**
		 *  User added or deleted lines
		 *  This only concerns us when the index of the saved highlight(s)
		 *  EXCEEDS the range of the indexed changes (meaning they were shifted)
		 *  1) Determine operation (carriage return, delete)
		 *  2) Round up the affected highlights
		 *  3) Update the store
		 */
		let highlights: Highlight[] | undefined = await store.get(context.globalState);
		if (!highlights) { return; }
		let op: Op = event.contentChanges[0].text === "\n" ? Op.ADD : Op.SUBTRACT;
		highlights.map((highlight: Highlight, index: number) => {
			// TODO define necessary interfaces
			// if ()
		});
	});
	workspace.onDidSaveTextDocument(() => {
		// shifter.dispatchChanges(context);
	});
	// workspace.onDidCloseTextDocument((doc: TextDocument) => {
	// 	shifter.didClose(context, doc);
	// });

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
