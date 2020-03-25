import { EventEmitter } from "events";
import { Selection, DecorationRenderOptions, QuickPickItem, QuickPick, window, ExtensionContext, InputBox, QuickInputButton, Uri } from "vscode";
import { readdirSync } from "fs";

export enum UserCommands {
    HIGHLIGHT = "extension.highlightSelection",
    FIND_HIGHLIGHT = "FIND_HIGHLIGHT",
    REMOVE_HIGHLIGHT = "REMOVE_HIGHLIGHT",
    REMOVE_HIGHLIGHTS = "REMOVE_HIGHLIGHTS",
}

export type Picker = QuickPick<QuickPickItem>;
export type Preferences = {};

export interface Style extends DecorationRenderOptions {}
export interface CommandMessage {
    event: any;
    style: Style;
}

abstract class Base {
    
    protected base_dir: string;
    protected colors_path: string;
    protected colors_dir_files: string[];
    private preferences: Preferences;

    constructor(context: ExtensionContext) {

        this.base_dir = context.extensionPath;
        this.colors_path = "src/resources/imgs/colors-picker";
        this.colors_dir_files = readdirSync(`${this.base_dir}/${this.colors_path}`);

        this.preferences = {};
    }
}

abstract class Agent extends Base {

    protected color_buttons: QuickInputButton[]; 
    protected color_picker: QuickPick<QuickPickItem>;
    protected context: ExtensionContext;
    protected emitter: EventEmitter;
    protected _input_box: InputBox;

    constructor(context: ExtensionContext, registrar: Function) {
        
        super(context);

        this.context = context;
        this.emitter = new EventEmitter();
        this.emitter.emit.bind(this);

        this.color_picker = window.createQuickPick<QuickPickItem>();
        this.color_picker.canSelectMany = false;
        this.color_picker.placeholder = 'Pick a color';

        this.color_buttons = [];
        for (const i in this.colors_dir_files) {
            this.color_buttons.push({
                iconPath: Uri.file(`${this.base_dir}${this.colors_path}${this.colors_dir_files[i]}`)
            });
            if (Number(i) === this.colors_dir_files.length - 1) {
                this.color_picker.buttons = this.color_buttons;
            }
        }

        this._input_box = window.createInputBox();
        this._input_box.onDidAccept.bind(this);
        
        registrar(
            UserCommands.HIGHLIGHT,
            () => {
                this._workflow_highlight();
            }
        );

    }
    private async _request_color(): Promise<string> {
        this.color_picker.show();
        return new Promise((resolve) => {
            this.color_picker.onDidTriggerButton(function (this: Agent, selection: any) {
                this.color_picker.dispose();
                resolve(
                    selection.iconPath.path
                    .replace(
                        `${this.base_dir}/${this.colors_path}`, 
                        ''
                    ).replace('.png', '')
                );
            });
        });
    }
    private _request_text(title: string): Promise<string> {
        this._input_box.title = title;
        this._input_box.show();
        return new Promise((resolve) => {
            this._input_box.onDidAccept(function(this: Agent) {
                resolve(this._input_box.value);
            }.bind(this));
        });
    }
    private async _workflow_highlight() {

        const value: string =
        await this._request_text("Give a name for this highlight to find it again!");
        const hex: string =
        await this._request_color();

        this.emitter.emit(
            UserCommands.HIGHLIGHT,
            {
                event: {
                    name: value,
                },
                style: {
                    isWholeLine: true,
                    light: {
                        backgroundColor: `#${hex}`,
                    },
                    dark: {
                        backgroundColor: `#${hex}`,
                    },
                }
            } as CommandMessage
        );
    }
}

abstract class DecorationTool extends Agent {
    constructor(context: ExtensionContext, registrar: Function) {
        super(context, registrar);
    }
    decorate(style: Style) {
        console.log(style);
    }
}

export class Highlighter extends DecorationTool {
    constructor(context: ExtensionContext, registrar: Function) {
        super(context, registrar);
        this.emitter.addListener(UserCommands.HIGHLIGHT, this.decorate);
    }
    decorate(event: any) {
        const e = event;
    }
}