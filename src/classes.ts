import { IHighlighter, IHighlight, ISubscriber } from './interfaces';
import * as vscode from 'vscode';
import * as constants from './constants';
import * as fs from 'fs';
import * as path from 'path';
import { rejects } from 'assert';

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
            if (existingMatches.length > 1) {
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
        this.selectHighlightLocation(selectedHighlight);
        
        return Promise.resolve(0);
    }
    public async removeHighlight(context: vscode.ExtensionContext): Promise<number> {

        // Get highlights
        console.log('Presenting highlights to remove...');
        var highlights: IHighlight[] | undefined = context.globalState.get('highlight-details');

        // Are there highlights to remove?
        if (!highlights) {
            vscode.window.showInformationMessage('You have no highlights to remove');
            return Promise.resolve(1);
        }
        if (highlights.length < 1) {
            vscode.window.showInformationMessage('You have no highlights to remove');
            return Promise.resolve(1);
        }

        // Prompt user to choose highlight to remove and wait for their choice
        var names = highlights.map((highlight: any) => { return highlight.name; });
        let selection: string = await vscode.window.showInformationMessage('Remove a highlight', ...names);
        let editor: any = vscode.window.activeTextEditor;
        let i: number;

        // Pop index
        highlights.forEach((highlight: IHighlight, index: number) => {
            if (highlight.name === selection) {
                highlights ? highlights.splice(index, 1) : console.log('No index to splice');
            }
        });

        // Restore original window line theme color
        const hexValue: vscode.ThemeColor = new vscode.ThemeColor('editor.background');
        this.decorate(editor, hexValue, editor.selection);

        return Promise.resolve(0);
    }
    public async removeAllHighlights(context: vscode.ExtensionContext) {

        // Get highlights
        let highlights: IHighlight[] | undefined = context.globalState.get(constants.HIGHLIGHTS_KEY);

        // Has highlights?
        if (!highlights) {
            vscode.window.showInformationMessage('No highlights to remove');
            return Promise.resolve(1);
        }

        // Remove and decorate current page
        let editor: any = vscode.window.activeTextEditor;
        context.globalState.update('highlight-details', []);
        highlights.forEach((highlight: IHighlight) => {
            this.decorate(editor, highlight.hexValue, editor.selection);
        });
        vscode.window.showInformationMessage('All your highlights have been removed');
        return Promise.resolve(0);
    }
    public async decorate(editor: vscode.TextEditor, hexValue: string | vscode.ThemeColor, selection: vscode.Selection): Promise<number> {
        const decorationTypeOptions: vscode.DecorationRenderOptions = {
            isWholeLine: true,
            light: {
                backgroundColor: `#${hexValue}`,
            },
            dark: {
                backgroundColor: `#${hexValue}`,
            },
        };
        const type = vscode.window.createTextEditorDecorationType(decorationTypeOptions);
        editor.setDecorations(type, [new vscode.Range(selection.start, selection.end)]);
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
                color: hexValue,
                uri: editor.document.uri,
                selection: editor.selection
            }]);
        } else {
            highlights.push({
                name: name,
                color: hexValue,
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
    private async selectHighlightLocation(selectedHighlight: IHighlight) {

        // Bring selection to view
        let range: vscode.Range = new vscode.Range(selectedHighlight.selection.start, selectedHighlight.selection.end);
        var editor: vscode.TextEditor = await vscode.window.showTextDocument(selectedHighlight.uri, { 
            selection: range
        });
        if (editor) {

            // Decorate presented view
            this.decorate(editor, selectedHighlight.hexValue, selectedHighlight.selection);
        }
    }
}
export class Subscriber implements ISubscriber {
    public async onActiveEditorDidChangeHandler(context: vscode.ExtensionContext, editor: vscode.TextEditor, highlighter: Highlighter) {
        /** Populate new view with existing highlights */
        console.log('active text editor changed');
        var highlights: Array<IHighlight> | undefined = context.globalState.get(constants.HIGHLIGHTS_KEY);
        if (editor && highlights) {
            var currentPageHighlights: Array<IHighlight> = highlights.filter((highlight: any) => { return highlight['uri']['path'] === editor['document']['uri']['path']; });
            if (currentPageHighlights) {
                currentPageHighlights.forEach((highlight: IHighlight) => {
                    highlighter.decorate(editor, highlight.hexValue, highlight.selection);
                });
            }
        }
        return Promise.resolve(0);
    }
    public onTextDocumentChangedHandler(context: vscode.ExtensionContext, event: vscode.TextDocumentChangeEvent, highlighter: Highlighter) {
        return Promise.resolve(0);
    }
}
export class Util {

}