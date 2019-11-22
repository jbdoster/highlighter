import * as Constants from './Constants';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { DisplacedHighlight, DisplacedHighlightsQueue, Highlight } from "./types";

/**
 * @class Highlighter
 * @function {Void} highlight_selection
 * @function {Void} find_highlight
 * @function {Void} remove_highlight
 * @function {Void} remove_all_highlights
 */
export class Highlighter {

    private subscribed = false;

    constructor() { }

    public async highlight_selection(context: vscode.ExtensionContext) {
        if (!this.subscribed) {
            await this.__subscribe(context);
        }
        console.log('Highlight lines called...');
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No line or folder selection has been made');
            return Promise.resolve();
        }
        await this.__handle_user_input(context, editor);
        return Promise.resolve();
    }

    public async find_highlight(context: vscode.ExtensionContext) {
        if (!this.subscribed) {
            await this.__subscribe(context);
        }
        console.log('Presenting highlights...');
        var highlights: Highlight[] | undefined = context.workspaceState.get('highlight-details');
        if (!highlights) {
            return;
        }
        if (highlights.length < 1) {
            vscode.window.showInformationMessage('You do not have any saved highlights');
            return Promise.resolve();
        }
        const names = highlights.map((highlight: Highlight) => { return highlight.name; });
        let selection = await vscode.window.showInformationMessage('Select a highlight', ...names);
        console.log(selection);
        const highlightInfo: any = highlights.filter((highlight: Highlight) => { return highlight.name === selection; });
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

    public async remove_highlight(context: vscode.ExtensionContext) {
        console.log('Presenting highlights to remove...');
        if (!this.subscribed) {
            let wait = await this.__subscribe(context);
        }
        var highlights: Highlight[] | undefined = context.workspaceState.get('highlight-details');
        if (!highlights) {
            return;
        }
        if (highlights.length < 1) {
            vscode.window.showInformationMessage('You have no highlights to remove');
            return Promise.resolve();
        }
        var names = highlights.map((highlight: Highlight) => { return highlight.name; });
        let selection: any = await vscode.window.showInformationMessage('Remove a highlight', ...names);
        let editor: any = vscode.window.activeTextEditor;
        var highlightInfo: Array<object> = highlights.filter((highlight: Highlight) => { return highlight.name === selection; });
        console.log(selection);
        this.__remove_stored_object(context, highlights, selection);
        this.__remove_decoration(editor, highlightInfo[0]);
        // return Promise.all([
        // ]);
    }

    public async remove_all_highlights(context: vscode.ExtensionContext) {
        if (!this.subscribed) {
            this.__subscribe(context);
        }
        let highlights: Highlight[] | undefined = context.workspaceState.get('highlight-details');
        if (!highlights) {
            return;
        }
        let editor: any = vscode.window.activeTextEditor;
        highlights.forEach((highlight: Highlight) => {
            this.__remove_decoration(editor, highlight);
        });
        context.workspaceState.update('highlight-details', []);
        vscode.window.showInformationMessage('All your highlights have been removed');
    }

    private async __handle_user_input(context: vscode.ExtensionContext, editor: vscode.TextEditor) {
        let input = vscode.window.createInputBox();
        input.title = "Give a name for this highlight to find it again!";
        input.show();
        let i: any        = await this.__on_name_input(input);
        if (!input.value) {
            vscode.window.showInformationMessage('No name set for selection, please try again');
            this.__handle_user_input(context, editor);
        }
        let exists: any = await this.__highlight_exists(context, input.value);
        if (exists === true) {
            vscode.window.showInformationMessage(`Highlight ${input.value} already exists, please choose a different name`);
            this.__handle_user_input(context, editor);
            return Promise.resolve();
        }
        let hexValue: any = await this.__on_color_input();
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
        const r: vscode.Range = this.__produce_range(editor);
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
            var highlights: Highlight[] | undefined = context.workspaceState.get('highlight-details');
            if (!highlights) {
                return;
            }
            if (event) {
                var currentPageHighlights = highlights.filter((highlight: Highlight) => { return highlight['uri']['path'] === event['document']['uri']['path']; });
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

    private async __on_name_input(input: vscode.InputBox) {
        return new Promise((resolve, reject) => {
            input.onDidAccept(() => {
                resolve();
            });
        });
    }

    private async __on_color_input() {
        let colorPicker: vscode.QuickPick<vscode.QuickPickItem> = vscode.window.createQuickPick();
        colorPicker.canSelectMany = false;
        colorPicker.placeholder = 'Pick a color';
        let buttons: Array<vscode.QuickInputButton> = [];
        var baseDir = path.resolve(__dirname).replace('out', 'extension/');
        const colorsDirFiles: Array<string> = fs.readdirSync(`${baseDir}${Constants.COLORS_PATH}`);
        const options: vscode.MessageOptions = {modal: true};
        colorsDirFiles.forEach((png, index) => {
            let button: vscode.QuickInputButton = {
                iconPath: vscode.Uri.file(`${baseDir}${Constants.COLORS_PATH}${png}`)
            };
            buttons.push(button);
            if (index === colorsDirFiles.length - 1) {
                colorPicker.buttons = buttons;
            }
        });
        colorPicker.show();
        return new Promise((resolve, reject) => {
            colorPicker.onDidTriggerButton((selection: any) => {
                let hexValue: string = this.__get_hex_value(`${baseDir}${Constants.COLORS_PATH}`, selection.iconPath.path);
                colorPicker.dispose();
                resolve(hexValue);
            });
        });
    }

    private __get_hex_value(colorsDir: string, selectionPath: any) {
        const hexValue: string = selectionPath.replace(colorsDir, '').replace('.png', '');
        return hexValue;
    }

    private __produce_range(editor: vscode.TextEditor) {
        let beg: Array<number> = [editor.selection.start.line, editor.selection.start.character];
        let end: Array<number> = [editor.selection.end.line, editor.selection.end.character];
        const range = new vscode.Range(
            new vscode.Position(beg[0], beg[1]),
            new vscode.Position(end[0], end[1])
        );
        return range;
    }

    private async __remove_stored_object(context: vscode.ExtensionContext, highlights: Highlight[], highlight_name: string) {
        let new_highlights: Highlight[] = [];
        for (var i in highlights) {
            if (highlights[i].name !== highlight_name) {
                new_highlights.push(highlights[i]);
            }
        }
        context.workspaceState.update('highlight-details', new_highlights);
        vscode.window.showInformationMessage(`highlight '${highlight_name}' removed`);
        return Promise.resolve();
    }

    private async __remove_decoration(editor: vscode.TextEditor, highlightInfo: any) {
        let e: any = vscode.window.activeTextEditor;
        if (e) {
            const color: vscode.ThemeColor = new vscode.ThemeColor('editor.background');
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
                e.setDecorations(type, [r]);
                return Promise.resolve('decorations removed');
            } else {
                return Promise.reject('No color theme pulled from config settings');
            }
        } else {
            return Promise.resolve('No editor instance available');
        }
    }

    private async __highlight_exists(context: vscode.ExtensionContext, highlight_name: string) {
        var highlights: Highlight[] | undefined = context.workspaceState.get('highlight-details');
        if (!highlights){
            return Promise.resolve(false);
        }
        for (var i in highlights) {
            if (highlights[i].name === highlight_name) {
                return Promise.resolve(true);
            }
        }
        return Promise.resolve(false);
    }

}

/**
 *  Enqueue changes
 *  Determine which highlights are affected.
 *  Affected highlights are only below the change position.
 *  Adjust each highlight accordingly.
 * 
 *  TLDR;
 *  We only care about the last change per highlight.
 *  We can choose to create a 2D matrix of 
 *  [Highlight per DisplacedHighlight] or just update
 *  an object of key Highlight name value Displaced Highlight
 *  since collisions are not an issue, overwriting is preferred.
 */
export class Displacement {

    private queues: DisplacedHighlightsQueue;

    constructor() { 
        this.queues = {};
    }

    public async enqueue(context: vscode.ExtensionContext, event: vscode.TextDocumentChangeEvent) {

        if (event.contentChanges.length < 1) { return; }


        let highlights: Highlight[] | undefined =
        context.workspaceState.get('highlight-details');

        if (!highlights) { return; }

        if (highlights.length < 1) { return; }

        for (let i = 0; i < highlights.length; i++) {

            if (highlights[i].startLine > event.contentChanges[0].range.end.line) { // highlight affected

                const offset = event.contentChanges[0].range.isSingleLine ? 1 : event.contentChanges[0].rangeLength;

                if (event.contentChanges[0].text === "\n") { // added line(s)

                    if (this.queues[highlights[i].name]) {
                        this.queues[highlights[i].name] = {
                            name: highlights[i].name,
                            startLine: this.queues[highlights[i].name].startLine + offset,
                            startChar: 0,
                            endLine: this.queues[highlights[i].name].endLine + offset,
                            endChar: 0,
                            uri: event.document.uri
                        } as DisplacedHighlight;
                    } else {
                        this.queues[highlights[i].name] = {
                            name: highlights[i].name,
                            startLine: highlights[i].startLine + offset,
                            startChar: 0,
                            endLine: highlights[i].endLine + offset,
                            endChar: 0,
                            uri: event.document.uri
                        } as DisplacedHighlight;
                    }

                    
                }
        
                if (event.contentChanges[0].text === "") { // deleted line(s)

                    const offset = event.contentChanges[0].range.isSingleLine ? 1 : event.contentChanges[0].rangeLength;
                    
                    if (this.queues[highlights[i].name]) {
                        this.queues[highlights[i].name] = {
                            name: highlights[i].name,
                            startLine: this.queues[highlights[i].name].startLine - offset,
                            startChar: 0,
                            endLine: this.queues[highlights[i].name].endLine - offset,
                            endChar: 0,
                            uri: event.document.uri
                        } as DisplacedHighlight;
                    } else {
                        this.queues[highlights[i].name] = {
                            name: highlights[i].name,
                            startLine: highlights[i].startLine - offset,
                            startChar: 0,
                            endLine: highlights[i].endLine - offset,
                            endChar: 0,
                            uri: event.document.uri
                        } as DisplacedHighlight;
                    }
                }

            }

            // if(){} // TODO if deplete highlight??

            // if(){} // TODO if whole highlight deleted??
            
        }

        return Promise.resolve();

    }

    public async dequeue(context: vscode.ExtensionContext, event: vscode.TextDocument) {

        let highlights: Highlight[] | undefined =
        context.workspaceState.get('highlight-details');

        if (!highlights) { return; }

        for (var i in highlights) {
            for (var j in this.queues) {
                if (highlights[i].name === this.queues[j].name) {
                    highlights[i] = Object.assign(highlights[i], this.queues[j]);
                }
            }
        }

        context.workspaceState.update('highlight-details', highlights);

        this.queues = {};

        return Promise.resolve();

    }
}