import * as constants from './constants';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
export class PageHighlighter {
    private subscribed = false;
    constructor() { }
    public async highlightSelection(context: vscode.ExtensionContext) {
        if (!this.subscribed) {
            let wait = await this.__subscribe(context);
        }
        console.log('Highlight lines called...');
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No line or folder selection has been made');
            return Promise.resolve();
        }
        let highlight = await this.__handleUserInput(context, editor);
        return Promise.resolve();
    }
    public async findHighlight(context: vscode.ExtensionContext) {
        if (!this.subscribed) {
            let wait = await this.__subscribe(context);
        }
        console.log('Presenting highlights...');
        var highlights: any = context.workspaceState.get('highlight-details');
        if (highlights.length < 1) {
            vscode.window.showInformationMessage('You do not have any saved highlights');
            return Promise.resolve();
        }
        const names = highlights.map((highlight: any) => { return highlight.name; });
        let selection = await vscode.window.showInformationMessage('Select a highlight', ...names);
        console.log(selection);
        const highlightInfo: any = highlights.filter((highlight: any) => { return highlight.name === selection; });
        const r = new vscode.Range(
            new vscode.Position(highlightInfo[0].startLine, highlightInfo[0].startChar),
            new vscode.Position(highlightInfo[0].endLine, highlightInfo[0].endChar)
        );
        let uri: vscode.Uri = vscode.Uri.parse(highlightInfo[0].uri.path);
        var editor: vscode.TextEditor = await vscode.window.showTextDocument(uri, { selection: r });
        if (editor) {
            const decorationTypeOptions: vscode.DecorationRenderOptions = {
                isWholeLine: true,
                light: {
                    backgroundColor: `#${highlightInfo.color}`,
                },
                dark: {
                    backgroundColor: `#${highlightInfo.color}`,
                },
            };
            const type = vscode.window.createTextEditorDecorationType(decorationTypeOptions);
            editor.setDecorations(type, [r]);
        }
        return Promise.resolve();
    }
    public async removeHighlight(context: vscode.ExtensionContext) {
        console.log('Presenting highlights to remove...');
        if (!this.subscribed) {
            let wait = await this.__subscribe(context);
        }
        var highlights: any = context.workspaceState.get('highlight-details');
        var names = highlights.map((highlight: any) => { return highlight.name; });
        let selection: any = await vscode.window.showInformationMessage('Remove a highlight', ...names);
        let editor: any = vscode.window.activeTextEditor;
        var highlightInfo: Array<object> = highlights.filter((highlight: any) => { return highlight.name === selection; });
        console.log(selection);
        return Promise.all([
            this.__removeStoredObject(context, highlights, selection),
            this.__removeDecoration(editor, highlightInfo[0]),
        ]);
    }
    public async removeAllHighlights(context: vscode.ExtensionContext) {
        if (!this.subscribed) {
            this.__subscribe(context);
        }
        let highlights: any = context.workspaceState.get('highlight-details');
        let editor: any = vscode.window.activeTextEditor;
        highlights.forEach((highlight: any) => {
            this.__removeDecoration(editor, highlight);
        });
        context.workspaceState.update('highlight-details', []);
        vscode.window.showInformationMessage('All your highlights have been removed');
    }
    // public async highlightFolder(context: vscode.ExtensionContext) {
    //     if (!this.subscribed) {
    //         this.__subscribe(context);
    //     }
    //     context.workspaceState.get('')
    // }
    private async __handleUserInput(context: vscode.ExtensionContext, editor: vscode.TextEditor) {
        let input = vscode.window.createInputBox();
        input.title = "Give a name for this highlight to find it again!";
        input.show();
        let i: any        = await this.__onNameInput(input);
        if (!input.value) {
            vscode.window.showInformationMessage('No name set for selection, please try again');
            this.__handleUserInput(context, editor);
        }
        let exists: any = await this.__highlightExists(context, input.value);
        if (exists === true) {
            vscode.window.showInformationMessage(`Highlight ${input.value} already exists, please choose a different name`);
            this.__handleUserInput(context, editor);
            return Promise.resolve();
        }
        let hexValue: any = await this.__onColorInput();
        let highlightName = input.value;
        input.dispose();
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
        const r: vscode.Range = this.__produceRange(editor);
        editor.setDecorations(type, [r]);
        const key = `highlight-details`;
        const previousObject: any = context.workspaceState.get(key);
        if (!previousObject) {
            console.log('No previous object, saving line highlight context for new key', key);
            context.workspaceState.update(key, [{
                name: highlightName,
                color: hexValue,
                range: r,
                uri: editor.document.uri,
                location: new vscode.Location(editor.document.uri, r),
                focusPosition: new vscode.Position(editor.selection.start.line, editor.selection.start.character),
                selection: editor.selection,
                startLine: editor.selection.start.line,
                startChar: editor.selection.start.character,
                endLine: editor.selection.end.line,
                endChar: editor.selection.end.character
            }]);
        } else {
            console.log('Key has already been used, editing previous object');
            previousObject.push({
                name: highlightName,
                color: hexValue,
                range: r,
                uri: editor.document.uri,
                location: new vscode.Location(editor.document.uri, r),
                focusPosition: new vscode.Position(editor.selection.start.line, editor.selection.start.character),
                selection: editor.selection,
                startLine: editor.selection.start.line,
                startChar: editor.selection.start.character,
                endLine: editor.selection.end.line,
                endChar: editor.selection.end.character
            });
        }
        console.log('User entered name', highlightName);
    }
    private __subscribe(context: vscode.ExtensionContext) {
        console.log('not yet subscribed, setting all listeners...');
        vscode.window.onDidChangeActiveTextEditor((event) => {
            console.log('active text editor changed');
            var highlights: any = context.workspaceState.get('highlight-details');
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
            } else {

            }
        });
        this.subscribed = true;
    }
    private async __onNameInput(input: vscode.InputBox) {
        return new Promise((resolve, reject) => {
            input.onDidAccept(() => {
                resolve();
            });
        });
    }
    private async __onColorInput() {
        let colorPicker: vscode.QuickPick<vscode.QuickPickItem> = vscode.window.createQuickPick();
        colorPicker.canSelectMany = false;
        colorPicker.placeholder = 'Pick a color';
        let buttons: Array<vscode.QuickInputButton> = [];
        var baseDir = path.resolve(__dirname).replace('out', 'extension/');
        const colorsDirFiles: Array<string> = fs.readdirSync(`${baseDir}${constants.COLORS_PATH}`);
        const options: vscode.MessageOptions = {modal: true};
        colorsDirFiles.forEach((png, index) => {
            let button: vscode.QuickInputButton = {
                iconPath: vscode.Uri.file(`${baseDir}${constants.COLORS_PATH}${png}`)
            };
            buttons.push(button);
            if (index === colorsDirFiles.length - 1) {
                colorPicker.buttons = buttons;
            }
        });
        colorPicker.show();
        return new Promise((resolve, reject) => {
            colorPicker.onDidTriggerButton((selection: any) => {
                let hexValue: string = this.__getHexValue(`${baseDir}${constants.COLORS_PATH}`, selection.iconPath.path);
                colorPicker.dispose();
                resolve(hexValue);
            });
        });
    }
    private __getHexValue(colorsDir: string, selectionPath: any) {
        const hexValue: string = selectionPath.replace(colorsDir, '').replace('.png', '');
        return hexValue;
    }
    private __produceRange(editor: vscode.TextEditor) {
        let beg: Array<number> = [editor.selection.start.line, editor.selection.start.character];
        let end: Array<number> = [editor.selection.end.line, editor.selection.end.character];
        const range = new vscode.Range(
            new vscode.Position(beg[0], beg[1]),
            new vscode.Position(end[0], end[1])
        );
        return range;
    }
    private async __removeStoredObject(context: vscode.ExtensionContext, highlights: Array<object>, selection: string) {
        let newHighlights = highlights.filter((highlight: any) => { return highlight.name !== selection; });
        context.workspaceState.update('highlight-details', newHighlights)
        .then((result) => {
            vscode.window.showInformationMessage(`highlight '${selection}' removed`);
            return Promise.resolve();
        });
    }
    private async __removeDecoration(editor: vscode.TextEditor, highlightInfo: any) {
        if (editor) {
            const color = new vscode.ThemeColor('editor.background');
            const decorationTypeOptions: vscode.DecorationRenderOptions = {
                isWholeLine: true,
                light: {
                    backgroundColor: color,
                },
                dark: {
                    backgroundColor: color,
                },
            };
            if (color) {
                const type = vscode.window.createTextEditorDecorationType(decorationTypeOptions);
                const r = new vscode.Range(
                    new vscode.Position(highlightInfo.startLine, highlightInfo.startChar),
                    new vscode.Position(highlightInfo.endLine, highlightInfo.endChar)
                );
                editor.setDecorations(type, [r]);
                return Promise.resolve('decorations removed');
            } else {
                return Promise.reject('No color theme pulled from config settings');
            }
        } else {
            return Promise.resolve('No editor instance available');
        }
    }
    private async __highlightExists(context: vscode.ExtensionContext, input: string) {
        var highlights: any = context.workspaceState.get('highlight-details');
        if (!highlights) {
            return Promise.resolve(false);
        }
        let highlight: any = highlights.filter((highlight: any) => { return highlight.name === input;});
        if (highlight.length > 0) {
            return Promise.resolve(true);
        } else {
            return Promise.resolve(false);
        }
    }
}
export class FolderHighlighter {
    private subscribed = false;
    public async highlightFolder(context: vscode.ExtensionContext) {
        if (!this.subscribed) {
            this.__subscribe(context);
        }
        context.workspaceState.get('');
    }
    private __subscribe(context: vscode.ExtensionContext) {
        console.log('not yet subscribed, setting all listeners...');
        vscode.window.onDidChangeActiveTextEditor((event) => {
            console.log('active text editor changed');
            var highlights: any = context.workspaceState.get('highlight-details');
            if (event) {
                var currentPageHighlights = highlights.filter((highlight: any) => { return highlight['uri']['path'] === event['document']['uri']['path']; });
                if (currentPageHighlights) {
                    currentPageHighlights.forEach((pageHighlight: any, index: any) => {
                        const decorationTypeOptions: vscode.DecorationRenderOptions = {
                            isWholeLine: true,
                            light: {
                                backgroundColor: `#${currentPageHighlights[index].color}`,
                            },
                            dark: {
                                backgroundColor: `#${currentPageHighlights[index].color}`,
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
            } else {

            }
        });
        this.subscribed = true;
    }
}