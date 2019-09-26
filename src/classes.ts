import { 
    USER_COLOR_CHOICE, 
    EDITOR_BG_COLOR, 
    HIGHLIGHTS_KEY, 
    COLORS_PATH, 
    EMPTY_STRING, 
    GIVE_A_NAME, 
    NO_SAVED_HIGHLIGHTS, 
    NO_NAME_SET, 
    PICK_A_COLOR 
} from './constants';
import * as fs from "fs";
import * as path from "path";
import { Highlight } from "./types";
import {
    DecorationRenderOptions, 
    ExtensionContext,
    InputBox,
    Memento, 
    QuickPick, 
    QuickPickItem,
    QuickInputButton,
    Range, 
    TextEditor, 
    ThemeColor, 
    TextEditorDecorationType, 
    Uri,
    window,
    Event, 
} from 'vscode';

class Base {
    protected editor: TextEditor | undefined;
    constructor() {
        this.editor = window.activeTextEditor;
    }
    public async get_editor(): Promise<void> {
        this.editor = window.activeTextEditor;
        return Promise.resolve();
    }
}
export class Style extends Base {
    private options: DecorationRenderOptions;
    private type: TextEditorDecorationType;
    constructor() {
        super();
        this.options = {
            isWholeLine: true,
            light: {
                backgroundColor: new ThemeColor(EDITOR_BG_COLOR),
            },
            dark: {
                backgroundColor: new ThemeColor(EDITOR_BG_COLOR),
            },
        };
        this.type = window.createTextEditorDecorationType(this.options);
    }
    public async decorate(highlights: Highlight[]): Promise<void> {
        await this.get_editor();
        if (this.editor) {
            for (let i = 0; i < highlights.length; i++) {
                this.options.light = new ThemeColor(`#${highlights[i].theme}`);
                this.options.dark  = new ThemeColor(`#${highlights[i].theme}`);
                this.type = window.createTextEditorDecorationType(this.options);
                this.editor.setDecorations(this.type, [highlights[i].selection]);
            }
        }
        return Promise.resolve();
    }
    public async undecorate(highlights: Highlight[]) {
        await this.get_editor();
        if (this.editor) {
            for (let i = 0; i < highlights.length; i++) {
                this.options.light = new ThemeColor(EDITOR_BG_COLOR);
                this.options.dark  = new ThemeColor(EDITOR_BG_COLOR);
                this.type = window.createTextEditorDecorationType(this.options);
                this.editor.setDecorations(this.type, [highlights[i].selection]);
            }
        }
        return Promise.resolve();
    }
}
export class Store extends Base {
    highlights: Highlight[] | undefined;
    constructor() {
        super();
        this.highlights = [];
    }
    public async get(state: Memento): Promise<Highlight[] | undefined> {
        return Promise.resolve(state.get(HIGHLIGHTS_KEY) as Highlight[]);
    }
    public async save(name: string, hex: string, state: Memento): Promise<void> {
        // get state memento with context.globalState -> get()
        // we want to limit the input we pass since typically 
        // input is not cached inline by interpreters
        await this.get_editor();
        this.highlights = await state.get(HIGHLIGHTS_KEY);
        this.highlights && this.editor ? this.highlights.push({
            name: name,
            theme: new ThemeColor(`#${hex}`),
            uri: this.editor.document.uri,
            selection: this.editor.selection,
        }) :
            console.log();
        state.update(HIGHLIGHTS_KEY, this.highlights);
        return Promise.resolve();
    }
    public async remove(name: string, state: Memento): Promise<void> {
        this.highlights = await this.get(state);
        if (!this.highlights || this.highlights.length < 1) {
            window.showInformationMessage(NO_SAVED_HIGHLIGHTS);
            return Promise.resolve();
        }
        this.highlights.forEach((highlight: Highlight, index: number) => {
            if (this.highlights && highlight.name === name) {
                delete this.highlights[index];
            }
        });
        state.update(HIGHLIGHTS_KEY, this.highlights);
        return Promise.resolve();
    }
    public async removeAll(state: Memento): Promise<void> {
        state.update(HIGHLIGHTS_KEY, []);
        return Promise.resolve();
    }
    public async update(list: Highlight[], state: Memento): Promise<void> {
        this.highlights = await this.get(state);
        if (!this.highlights) { return; }
        this.highlights.map((highlight: Highlight) => {
            for (let i = 0; i < list.length; i++) {
                if (highlight.name === list[i].name) {
                    highlight = list[i];
                }
            }
        });
        state.update(HIGHLIGHTS_KEY, this.highlights);
        return Promise.resolve();
    }
}
export class Present {
    private buttons: Array<QuickInputButton> = [];
    private colorPicker: QuickPick<QuickPickItem> = window.createQuickPick();
    private baseDir = path.resolve(__dirname).replace('out', 'extension/');
    private colorsDirFiles: Array<string> = fs.readdirSync(`${this.baseDir}${COLORS_PATH}`);
    constructor() { }
    public async choose_highlight_color(): Promise<string> {
        // Create color quick picker
        this.colorPicker.canSelectMany = false;
        this.colorPicker.placeholder = PICK_A_COLOR;

        // Create and present buttons
        this.colorsDirFiles.forEach((png, index) => {
            let button: QuickInputButton = {
                iconPath: Uri.file(`${this.baseDir}${COLORS_PATH}${png}`)
            };
            this.buttons.push(button);
            if (index === this.colorsDirFiles.length - 1) {
                this.colorPicker.buttons = this.buttons;
            }
        });
        this.colorPicker.buttons = this.buttons;
        this.colorPicker.show();

        // Await and resolve user's color selection
        return new Promise((resolve, reject) => {
            this.colorPicker.onDidTriggerButton((button: QuickInputButton) => {
                const hexValue: string = 
                button.iconPath.toString()
                .replace(`${this.baseDir}${COLORS_PATH}`, '')
                .replace('.png', '');
                this.colorPicker.dispose();
                resolve(hexValue ? hexValue : EMPTY_STRING);
            });
        });
    }
    public async choose_highlight_name(): Promise<string> {
        // Ask for input
        let input: InputBox = window.createInputBox();
        input.title = GIVE_A_NAME;
        input.show();

        // Notify caller user has input value
        return new Promise((resolve, reject) => {
            input.onDidAccept(() => {
                if (!input.value) {
                    window.showInformationMessage(NO_NAME_SET);
                    this.choose_highlight_name();
                } else {
                    resolve(input.value);
                }
            });
        });
    }
    public async choose_find_highlight(highlights: Highlight[]): Promise<Highlight | void> {
        // Has highlights?
        if (highlights.length < 1) {
            window.showInformationMessage(NO_SAVED_HIGHLIGHTS);
            return Promise.resolve();
        }

        //  Take the user to their selected highlight
        let selections: Array<string> = [];
        highlights.forEach((h: Highlight) => {
            selections.push(`${h.name} - ${h.uri.path}`);
        });

        // Show selections to user
        return new Promise((resolve, reject) => {
            let quickPick: Thenable<string | undefined> = window.showQuickPick(selections);
            if (quickPick) {

                // Reduce choice to just the highlight name for highlight match
                quickPick.then((choice: string | undefined) => {
                    if (choice) {
                        let highlight: Highlight[] = highlights.filter((h: Highlight) => {
                            return h.name === choice;
                        });
                        resolve(highlight[0] as Highlight);
                    } else {
                        resolve();
                    }
                });
            }
        });
    }
}
export class Navigate {
    constructor() { }
    public async go_to(highlight: Highlight): Promise<void> {
        const editor: TextEditor = await window.showTextDocument(highlight.uri, {
            selection: highlight.selection
        });
        return Promise.resolve();
    }
}
