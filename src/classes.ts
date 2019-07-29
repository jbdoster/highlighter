import { IHighlighter, IHighlight, ISubscriber } from './interfaces';
import * as vscode from 'vscode';
import * as constants from './constants';
import * as fs from 'fs';
import * as path from 'path';

export class Highlighter implements IHighlighter {
    
    /** PUBLIC */
    public async highlightSelection(context: vscode.ExtensionContext): Promise<number> {
        console.log('Highlight lines called...');
        const editor = vscode.window.activeTextEditor;

        // User made edits?
        if (!editor) {
            vscode.window.showInformationMessage('No line or folder selection has been made');
            return Promise.resolve(1);
        }

        // Wait for user to enter value
        let name: string = await this.acquireHighlightName();

        // Wait for user to choose highlight color
        let hexValue: string = await this.acquireColorChoice();

        // Does this highlight already exist?
        var highlights: Array<IHighlight> | undefined = context.globalState.get('highlight-details');

        // No pre-existing highlights? Save
        if (!highlights) {
            this.saveHighlight(context, editor, hexValue, name);
            this.decorate(editor, hexValue, editor.selection);
        } else {
            var exists: boolean = false;
            highlights.forEach((highlight: IHighlight) => {
                if (highlight.name === name) {
                    exists = true;
                }
            });
            if (exists) {
                vscode.window.showInformationMessage(`Highlight '${name}' already exists, please choose a different name`);
                return Promise.resolve(1);
            }
            this.saveHighlight(context, editor, hexValue, name);
            this.decorate(editor, hexValue, editor.selection);
        }
        return Promise.resolve(0);
    }
    public async findHighlight(context: vscode.ExtensionContext): Promise<number> {
        console.log('Presenting highlights...');
        var highlights: Array<IHighlight> | undefined = context.globalState.get('highlight-details');
        if (!highlights) {
            vscode.window.showInformationMessage('You do not have any saved highlights');
            return Promise.resolve(1);
        }
        if (highlights.length < 1) {
            vscode.window.showInformationMessage('You do not have any saved highlights');
            return Promise.resolve(1);
        }
        const names   = highlights.map((highlight: any) => { 
            return highlight.name; 
        });
        let selection = await vscode.window.showInformationMessage('Select a highlight', ...names);
        const highlight: IHighlight[] = highlights.filter((highlight: any) => { 
            return highlight.name === selection; 
        });
        let uri: vscode.Uri = vscode.Uri.parse(highlight[0].uri.path);
        let range: vscode.Range = new vscode.Range(highlight[0].selection.start, highlight[0].selection.end);
        var editor: vscode.TextEditor = await vscode.window.showTextDocument(uri, { 
            selection: range
        });
        if (editor) {
            const decorationTypeOptions: vscode.DecorationRenderOptions = {
                isWholeLine: true,
                light: {
                    backgroundColor: `#${highlight[0].hexValue}`,
                },
                dark: {
                    backgroundColor: `#${highlight[0].hexValue}`,
                },
            };
            const type = vscode.window.createTextEditorDecorationType(decorationTypeOptions);
            editor.setDecorations(type, [range]);
        }
        return Promise.resolve(0);
    }
    public async removeHighlight(context: vscode.ExtensionContext): Promise<number> {
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
        let highlights: IHighlight[] | undefined = context.globalState.get(constants.HIGHLIGHTS_KEY);
        if (!highlights) {
            vscode.window.showInformationMessage('No highlights to remove');
            return Promise.resolve(1);
        }
        let editor: any = vscode.window.activeTextEditor;
        highlights.forEach((highlight: IHighlight) => {
            this.decorate(editor, highlight.hexValue, editor.selection);
        });
        context.globalState.update('highlight-details', []);
        vscode.window.showInformationMessage('All your highlights have been removed');
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
        let colorPicker: vscode.QuickPick<vscode.QuickPickItem> = vscode.window.createQuickPick();
        colorPicker.canSelectMany = false;
        colorPicker.placeholder = 'Pick a color';
        let buttons: Array<vscode.QuickInputButton> = [];
        var baseDir = path.resolve(__dirname).replace('out', 'extension/');
        const colorsDirFiles: Array<string> = fs.readdirSync(`${baseDir}${constants.COLORS_PATH}`);
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
        return new Promise((resolve, reject) => {
            colorPicker.onDidTriggerButton((selection: any) => {
                const hexValue: string = selection.iconPath.path.replace(`${baseDir}${constants.COLORS_PATH}`, '').replace('.png', '');
                colorPicker.dispose();
                resolve(hexValue);
            });
        });
    }
    private async decorate(editor: vscode.TextEditor, hexValue: string | vscode.ThemeColor, selection: vscode.Selection): Promise<number> {
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
    private saveHighlight(context: vscode.ExtensionContext, editor: vscode.TextEditor, hexValue: string, name: string): Promise<number> {
        console.log('No previous object, saving line highlight context for new key', name);
        let highlights: object[] | undefined = context.globalState.get(constants.HIGHLIGHTS_KEY);
        if (!highlights) {
            context.globalState.update(constants.HIGHLIGHTS_KEY, [{
                name: name,
                color: hexValue,
                uri: editor.document.uri,
                selectiaon: editor.selection
            }]);
        } else {
            highlights.push({
                name: name,
                color: hexValue,
                uri: editor.document.uri,
                selectiaon: editor.selection
            });
        }
        return Promise.resolve(0);
    }
}
export class Subscriber implements ISubscriber {
    public async onTextDocumentChangedHandler(context: vscode.ExtensionContext, event: vscode.TextDocumentChangeEvent) {
        console.log('active text editor changed');
        var highlights: any = context.globalState.get('highlight-details');
        if (event) {
            var currentPageHighlights = highlights.filter((highlight: any) => { return highlight['uri']['path'] === event['document']['uri']['path']; });
            if (currentPageHighlights) {
                currentPageHighlights.forEach((pageHighlight: any) => {
                    const decorationTypeOptions: vscode.DecorationRenderOptions = {
                        isWholeLine: true,
                        light: {
                            backgroundColor: `#${pageHighlight.color}`,
                        },
                        dark: {
                            backgroundColor: `#${pageHighlight.color}`,
                        },
                    };
                    const type = vscode.window.createTextEditorDecorationType(decorationTypeOptions);
                    const r = new vscode.Range(
                        new vscode.Position(pageHighlight.startLine, pageHighlight.startChar),
                        new vscode.Position(pageHighlight.endLine, pageHighlight.endChar)
                    );
                    const __innerEditor = vscode.window.activeTextEditor;

                    if (__innerEditor) {
                        __innerEditor.setDecorations(type, [r]);
                    }
                });
            }
        }
        return Promise.resolve(0);
    }
    public onActiveEditorDidChangeHandler(context: vscode.ExtensionContext) {
        return Promise.resolve(0);
    }
}
export class Util {

}