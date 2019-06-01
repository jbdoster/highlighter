import * as vscode from 'vscode';
export class Highlighter {
    private subscribed = false;
    constructor() { }
    public highlightSelection(context: vscode.ExtensionContext) {
        console.log('Highlight lines called...');
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No line or folder selection has been made');
            return;
        }
        if (!this.subscribed) {
            this.__subscribe(context);
        }
        this.__handleUserInput(context, editor);
    }
    private __handleUserInput(context: vscode.ExtensionContext, editor: vscode.TextEditor) {
        let input = vscode.window.createInputBox();
        input.title = "Give a name for this highlight to find it again!";
        input.show();
        input.onDidAccept((b) => {
            let highlightName = input.value;
            input.dispose();
            if (!input.value) {
                vscode.window.showInformationMessage('No name set for selection');
            }
            const decorationTypeOptions: vscode.DecorationRenderOptions = {
                isWholeLine: true,
                light: {
                    backgroundColor: "#9fbfdf",
                },
                dark: {
                    backgroundColor: "#9fbfdf",
                },
            };
            const type = vscode.window.createTextEditorDecorationType(decorationTypeOptions);
            const r = new vscode.Range(
                new vscode.Position(editor.selection.start.line, editor.selection.start.character),
                new vscode.Position(editor.selection.end.line, editor.selection.end.character)
            );
            editor.setDecorations(type, [r]);
            const key = `highlight-details`;
            const previousObject: any = context.workspaceState.get(key);
            if (!previousObject) {
                console.log('No previous object, saving line highlight context for new key', key);
                context.workspaceState.update(key, [{
                    name: highlightName,
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
        });
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
                                backgroundColor: "#9fbfdf",
                            },
                            dark: {
                                backgroundColor: "#9fbfdf",
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
    public findHighlight(context: vscode.ExtensionContext) {
        console.log('Presenting highlights...');
        var highlights: any = context.workspaceState.get('highlight-details');
        if (highlights.length < 1) {
            vscode.window.showInformationMessage('You do not have any saved highlights');
            return;
        }
        var names = highlights.map((highlight: any) => { return highlight.name });
        vscode.window
            .showInformationMessage('Select a highlight', ...names)
            .then((selection) => {
                console.log(selection);
                var highlightInfo: any = highlights.filter((highlight: any) => { return highlight.name === selection; });
                vscode.window.showTextDocument(
                    highlightInfo[0].uri, {
                        selection: highlightInfo[0].range
                    });
                const decorationTypeOptions: vscode.DecorationRenderOptions = {
                    isWholeLine: true,
                    light: {
                        backgroundColor: "#9fbfdf",
                    },
                    dark: {
                        backgroundColor: "#9fbfdf",
                    },
                };
                setTimeout(() => {
                    const editor = vscode.window.activeTextEditor;
                    const type = vscode.window.createTextEditorDecorationType(decorationTypeOptions);
                    const r = new vscode.Range(
                        new vscode.Position(highlightInfo[0].selection.start.line, highlightInfo[0].selection.start.character),
                        new vscode.Position(highlightInfo[0].selection.end.line, highlightInfo[0].selection.end.character)
                    );
                    if (editor) {
                        editor.setDecorations(type, [r]);
                    }
                }, 700);
            });
    }
    public removeHighlight(context: vscode.ExtensionContext) {
        console.log('Presenting highlights to remove...');
        var highlights: any = context.workspaceState.get('highlight-details');
        var names = highlights.map((highlight: any) => { return highlight.name });
        vscode.window
            .showInformationMessage('Remove a highlight', ...names)
            .then((selection) => {
                var highlightInfo: Array<object> = highlights.filter((highlight: any) => { return highlight.name === selection; });
                console.log(selection);
                return Promise.all([
                    this.__removeStoredObject(context, highlights, selection),
                    this.__removeDecoration(highlightInfo[0]),
                ]);
            });
    }
    private async __removeStoredObject(context: vscode.ExtensionContext, highlights: Array<object>, selection: string) {
        let newHighlights = highlights.filter((highlight: any) => { return highlight.name !== selection; });
        context.workspaceState.update('highlight-details', newHighlights);
        return Promise.resolve();
    }
    private async __removeDecoration(highlightInfo: any) {
        let editor = vscode.window.activeTextEditor;
        if (editor) {
            const color = new vscode.ThemeColor('editor.background');
            if (color) {
                const decorationTypeOptions: vscode.DecorationRenderOptions = {
                    isWholeLine: true,
                    light: {
                        backgroundColor: color,
                    },
                    dark: {
                        backgroundColor: color,
                    },
                };
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
            return Promise.reject('No editor instance available');
        }
    }
    public async removeAllHighlights(context: vscode.ExtensionContext) {
        let highlights: any = context.workspaceState.get('highlight-details');
        highlights.forEach((highlight: any) => {
            this.__removeDecoration(highlight);
        });
        context.workspaceState.update('highlight-details', []);
        vscode.window.showInformationMessage('All your highlights have been removed');
    }
}