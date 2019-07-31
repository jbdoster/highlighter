import { IHighlighter, IHighlight, ISubscriber, IHighlightQueueInput } from './interfaces';
import * as vscode from 'vscode';
import * as constants from './constants';
import * as fs from 'fs';
import * as path from 'path';
import { rejects, doesNotThrow } from 'assert';
import { PassThrough } from 'stream';

export class Highlighter implements IHighlighter {
    
    /** PUBLIC */
    public async highlightSelection(context: vscode.ExtensionContext): Promise<number> {

        // Get active text file
        console.log('Highlight lines called...');
        const editor = vscode.window.activeTextEditor;

        // User made edits?
        if (!editor) {
            vscode.window.showInformationMessage('No line or folder selection has been made');
            return Promise.resolve(1);
        }

        
        // Wait for user to enter value
        let name: string = await this.acquireHighlightName();
        
        // Get highlights
        let highlights: Array<IHighlight> | undefined = context.globalState.get(constants.HIGHLIGHTS_KEY);

        if (highlights) {

            //  Pull list of existing matching names
            let existingMatches: Array<any> = highlights.filter(h => {return h.name === name; });
            
            // Exists? Reproduce try again
            if (existingMatches.length > 0) {
                vscode.window.showInformationMessage(`Highlight '${name}' already exists, please choose a different name`);
                this.highlightSelection(context);
                return Promise.resolve(1);
            }
        }

        // Wait for user to choose highlight color
        let hexValue: string = await this.acquireColorChoice();

        // Save hightlight and decorate current view
        this.saveHighlight(context, editor, hexValue, name);
        this.decorate(editor, hexValue, editor.selection);
        return Promise.resolve(0);
    }
    public async findHighlight(context: vscode.ExtensionContext): Promise<number> {

        // Get highlights
        let highlights: Array<IHighlight> | undefined = context.globalState.get(constants.HIGHLIGHTS_KEY);
        
        // Has highlights?
        if (!highlights) {
            vscode.window.showInformationMessage('You do not have any saved highlights');
            return Promise.resolve(1);
        }
        if (highlights.length < 1) {
            vscode.window.showInformationMessage('You do not have any saved highlights');
            return Promise.resolve(1);
        }

        //  Get user's highlight selection to bring to view
        let selectedHighlight: IHighlight = await this.showHighlights(highlights);

        //  Take the user to their selected highlight
        let range: vscode.Range = new vscode.Range(selectedHighlight.selection.start, selectedHighlight.selection.end);
        const editor: vscode.TextEditor = await vscode.window.showTextDocument(selectedHighlight.uri, { 
            selection: range
        });

        // Decorate the located highlight
        this.decorate(editor, selectedHighlight.hexValue, selectedHighlight.selection);
        return Promise.resolve(0);
    }
    public async removeHighlight(context: vscode.ExtensionContext): Promise<number> {

        // Get highlights
        let highlights: Array<IHighlight> | undefined = context.globalState.get(constants.HIGHLIGHTS_KEY);
        
        // Has highlights?
        if (!highlights || highlights.length < 1) {
            vscode.window.showInformationMessage('You do not have any saved highlights');
            return Promise.resolve(1);
        }

        //  Get user's highlight selection to bring to view
        let selectedHighlight: IHighlight = await this.showHighlights(highlights);

        // Pop index
        highlights.forEach((highlight: IHighlight, index: number) => {
            if (highlight.name === selectedHighlight.name) {
                highlights ? highlights.splice(index, 1) : console.log('No index to splice');
            }
        });

        // Update saved highlights object
        context.globalState.update(constants.HIGHLIGHTS_KEY, highlights);

        // Get active editor and restore lines to original theme color
        const editor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
        if (editor) {
            
            // Restore original window line theme color
            const hexValue: vscode.ThemeColor = new vscode.ThemeColor('editor.background');
            this.decorate(editor, hexValue, selectedHighlight.selection);
        }

        return Promise.resolve(0);
    }
    public async removeAllHighlights(context: vscode.ExtensionContext) {
        
        // Get highlights
        let highlights: IHighlight[] | undefined = context.globalState.get(constants.HIGHLIGHTS_KEY);
        
        // Remove saved highlights
        context.globalState.update(constants.HIGHLIGHTS_KEY, []);

        // Has highlights?
        if (!highlights) {
            vscode.window.showInformationMessage('No highlights to remove');
            return Promise.resolve(1);
        }

        // Decorate any highlights on existing page
        const editor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
        if (editor) {
            const hexValue: vscode.ThemeColor = new vscode.ThemeColor('editor.background');
            highlights.forEach((highlight) => {
                if (highlight.uri === editor.document.uri) {
                    this.decorate(editor, hexValue, highlight.selection);
                }
            });
        }
        vscode.window.showInformationMessage('All your highlights have been removed');
        return Promise.resolve(0);
    }
    public async decorate(editor: vscode.TextEditor, hexValue: string | vscode.ThemeColor, selection: vscode.Selection): Promise<number> {
        
        // string type? ThemeColor type?
        const decorationTypeOptions: vscode.DecorationRenderOptions = {
            isWholeLine: true,
            light: {
                backgroundColor: `#${hexValue}`,
            },
            dark: {
                backgroundColor: `#${hexValue}`,
            },
        };
        const type: vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType(decorationTypeOptions);
        editor.setDecorations(type, [
            new vscode.Selection(
                new vscode.Position(selection.start.line, selection.start.character), 
                new vscode.Position(selection.end.line,   selection.end.character  ) 
            )
        ]);
        return Promise.resolve(0);
    }
    /** PRIVATE */
    private async acquireHighlightName(): Promise<string> {

        // Ask for input
        let input: vscode.InputBox = vscode.window.createInputBox();
        input.title = "Give a name for this highlight to find it again!";
        input.show();

        // Notify caller user has input value
        return new Promise((resolve, reject) => {
            input.onDidAccept(() => {
                if (!input.value) {
                    vscode.window.showInformationMessage('No name set for selection, please try again');
                    this.acquireHighlightName();
                } else {
                    resolve(input.value);
                }
            });
        });
    }
    private async acquireColorChoice(): Promise<string> {

        // Create color quick picker
        let colorPicker: vscode.QuickPick<vscode.QuickPickItem> = vscode.window.createQuickPick();
        colorPicker.canSelectMany = false;
        colorPicker.placeholder = 'Pick a color';
        let buttons: Array<vscode.QuickInputButton> = [];
        var baseDir = path.resolve(__dirname).replace('out', 'extension/');
        const colorsDirFiles: Array<string> = fs.readdirSync(`${baseDir}${constants.COLORS_PATH}`);

        // Create and present buttons
        colorsDirFiles.forEach((png, index) => {
            let button: vscode.QuickInputButton = {
                iconPath: vscode.Uri.file(`${baseDir}${constants.COLORS_PATH}${png}`)
            };
            buttons.push(button);
            if (index === colorsDirFiles.length - 1) {
                colorPicker.buttons = buttons;
            }
        });
        colorPicker.buttons = buttons;
        colorPicker.show();

        // Await and resolve user's color selection
        return new Promise((resolve, reject) => {
            colorPicker.onDidTriggerButton((selection: any) => {
                const hexValue: string = selection.iconPath.path.replace(`${baseDir}${constants.COLORS_PATH}`, '').replace('.png', '');
                colorPicker.dispose();
                resolve(hexValue);
            });
        });
    }
    private saveHighlight(context: vscode.ExtensionContext, editor: vscode.TextEditor, hexValue: string, name: string): Promise<number> {

        // Get highlights
        let highlights: object[] | undefined = context.globalState.get(constants.HIGHLIGHTS_KEY);

        // Has highlight?
        if (!highlights) {
            context.globalState.update(constants.HIGHLIGHTS_KEY, [{
                name: name,
                hexValue: hexValue,
                uri: editor.document.uri,
                selection: editor.selection
            }]);
        } else {
            highlights.push({
                name: name,
                hexValue: hexValue,
                uri: editor.document.uri,
                selection: editor.selection
            });
        }
        return Promise.resolve(0);
    }
    private showHighlights(highlights: Array<IHighlight>): Promise<IHighlight> {

        // Format selections for user
        let selections: Array<string> = [];
        highlights.forEach((h) => {
            selections.push(`${h.name} - ${h.uri.path}`);
        });

        // Show selections to user
        return new Promise((resolve, reject) => {
            let quickPick: Thenable<string | undefined> = vscode.window.showQuickPick(selections);
            if (quickPick) {

                // Reduce choice to just the highlight name for highlight match
                quickPick.then((selection: string | undefined) => {
                    if (selection) {
                        let delimiterIndex: number = selection.indexOf('-');
                        let name: string = selection.slice(0, delimiterIndex).trim();
                        let highlight: Array<IHighlight> = highlights.filter((h: IHighlight) => { return h.name === name; });
                        resolve(highlight[0]);
                    }
                });
            }
        });
    }
}
export class Subscriber implements ISubscriber {
    public async onActiveEditorDidChangeHandler(context: vscode.ExtensionContext, editor: vscode.TextEditor, highlighter: Highlighter): Promise<void> {
 
        /** Populate new view with existing highlights */
        var highlights: Array<IHighlight> | undefined = context.globalState.get(constants.HIGHLIGHTS_KEY);
        if (highlights) {
            var applyHighlights: Array<IHighlight> = highlights.filter(h => {return h.uri.fsPath === editor.document.uri.fsPath;});
            applyHighlights.forEach((highlight: IHighlight) => {
                highlighter.decorate(editor, highlight.hexValue, highlight.selection);
            });
        }
        return Promise.resolve();
    }
    public onTextDocumentChangedHandler(context: vscode.ExtensionContext, event: vscode.TextDocumentChangeEvent, highlighter: Highlighter, queue: HighlightShiftQueue): void {
        
        // Result of carriage return?
        if (event.contentChanges[0].text.includes("\n")) {
            queue.enqueue('downward', context, event, highlighter);
        }
        
        // Result of line deleted? 
        if (event.contentChanges[0].text === "") {
            queue.enqueue('upward', context, event, highlighter);
        }
    }
}
export class HighlightShiftQueue {

    /** Member vars representing an event
     *  where the user enters a carriage return
     *  or deletes a lines which affects existing 
     *  highlights
     */
    private upwardQueue:     Array<IHighlightQueueInput> = [];
    private downwardQueue:   Array<IHighlightQueueInput> = [];
    private upwardIsEmpty:   boolean                     = true;
    private downwardIsEmpty: boolean                     = true;
    private upwardId:        number                      = 0;
    private downwardId:      number                      = 0;

    constructor() {

        // Keep queue alive
        setInterval(()=>{},10000);

        // Dequeue if !empty
        while (!this.upwardIsEmpty) {
            this._dequeueUpward  ();
        }
        while (!this.downwardIsEmpty) {
            this._dequeueDownward();
        }
    }

    public enqueue(queueType: string, context: vscode.ExtensionContext, event: vscode.TextDocumentChangeEvent, highlighter: Highlighter): void {
        
        // Async (NO await!!) to pass to static event loop provided by the VM
        switch (queueType) {
            case 'upwardShifts':
                this.upwardQueue.push({
                    context:     context,
                    event:       event,
                    highlighter: highlighter,
                    id:          this.upwardId
                });
                this.upwardId += 1;
                break;

            case 'downwardShifts':
                this.downwardQueue.push({
                    context:     context,
                    event:       event,
                    highlighter: highlighter,
                    id:          this.downwardId
                });
                this.downwardId += 1;
                break;
        }
    }
    private async _dequeueUpward() {

        //  FIFO
        let queueItem: IHighlightQueueInput = this.upwardQueue[0];

        // Get highlights
        let highlights: Array<IHighlight> | undefined = queueItem.context.globalState.get(constants.HIGHLIGHTS_KEY);
                    
        if (highlights) {
            
            // Any affected highlights?
            let affectedHighlights: Array<IHighlight> = highlights.filter(h=>{ return h.selection.start > queueItem.event.contentChanges[0].range.start;});

            // Adjust selection positions
            affectedHighlights.map(h=>{
                h.selection = new vscode.Selection(
                    new vscode.Position(h.selection.start.line - 1, h.selection.start.character), 
                    new vscode.Position(h.selection.end.line   - 1, h.selection.end.character  ) 
                );
            });
            
            // Update affected highlights
            highlights.forEach((h, index)=>{
                if (h.name === affectedHighlights[index].name && highlights) {
                    highlights[index] = affectedHighlights[index];
                }
            });

            // Save new highlights
            queueItem.context.globalState.update(constants.HIGHLIGHTS_KEY, highlights);
            
            // Track
            console.warn(`Dequeued upward ID ${queueItem.id}`);
        }
    }
    private async _dequeueDownward() {

        //  FIFO
        let queueItem: IHighlightQueueInput = this.downwardQueue[0];

        // Result of carriage return?
        if (queueItem.event.contentChanges[0].text.includes("\n")) {

            // Get highlights
            let highlights: Array<IHighlight> | undefined = queueItem.context.globalState.get(constants.HIGHLIGHTS_KEY);
            
            if (highlights) {
                
                // Any affected highlights?
                let affectedHighlights: Array<IHighlight> = highlights.filter(h=>{ 

                    // Is part of the currently active 
                    // file and located in an index 
                    // after the new line break?
                    return h.selection.start >= queueItem.event.contentChanges[0].range.start &&
                        h.uri.fsPath === queueItem.event.document.uri.fsPath;
                });

                // Adjust selection positions for affected highlights
                affectedHighlights.map(h=>{

                    // Assign whole selection property of 
                    // IHighlight since vscode.Selection
                    // type is read-only
                    return h.selection = new vscode.Selection(
                        new vscode.Position(h.selection.start.line + 1, h.selection.start.character), 
                        new vscode.Position(h.selection.end.line   + 1, h.selection.end.character  ) 
                    );
                });

                // No highlights? Resolve
                if (!highlights) {
                    return Promise.resolve();
                }
                
                // Update existing highlights with affected highlights
                highlights.forEach((h, index)=>{
                    if (h.name === affectedHighlights[index].name) {
                        highlights ? highlights[index] = affectedHighlights[index] : console.log();
                    }
                });

                // Save new highlights
                queueItem.context.globalState.update(constants.HIGHLIGHTS_KEY, highlights);

                // Track
                console.warn(`Dequeued downward ID ${queueItem.id}`);
            }
        }
    }
}