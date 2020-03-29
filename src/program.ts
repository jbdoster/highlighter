import { EventEmitter } from "events";
import { Selection, DecorationRenderOptions, QuickPickItem, QuickPick, window, ExtensionContext, InputBox, QuickInputButton, Uri, workspace } from "vscode";
import { readdirSync } from "fs";

export enum StorageDestinations {
    GLOBAL = "globalState",
    WORKSPACE = "workspaceState",
}

export enum UserCommands {
    HIGHLIGHT = "extension.highlightSelection",
    FIND_HIGHLIGHT = "FIND_HIGHLIGHT",
    REMOVE_HIGHLIGHT = "REMOVE_HIGHLIGHT",
    REMOVE_HIGHLIGHTS = "REMOVE_HIGHLIGHTS",
}

export type Picker = QuickPick<QuickPickItem>;
export type Preferences = {};
export interface StorageMessage {
    identifier: string;
    storage_destination: StorageDestinations;
}

export interface Event {
    name: string;
    selection: Selection;
    storage_destination: StorageDestinations;
    uri: Uri;
}
export interface Style extends DecorationRenderOptions {}
export interface CommandMessage {
    event: Event;
    selection: Selection;
    style: Style;
}
abstract class Base {
    
    protected base_dir: string;
    protected colors_path: string;
    protected colors_dir_files: string[];
    private preferences: Preferences;

    constructor(context: ExtensionContext) {

        this.base_dir = context.extensionPath;
        this.colors_path = "/src/resources/imgs/colors-picker/";
        this.colors_dir_files = readdirSync(`${this.base_dir}${this.colors_path}`);

        this.preferences = {};
    }
}

class Storage extends Base {
    protected context: ExtensionContext;
    constructor(context: ExtensionContext) {
        super(context);
        this.context = context;
    }

    protected async load(message: StorageMessage) {
        return this.context[
            message.storage_destination
        ].get(message.identifier);
    }

    protected async _on_store(event: StorageMessage) {

        const highlights: any[] | undefined =
        this.context[event.storage_destination].get(event.identifier);
        if (!highlights) { return; }

        highlights.push(event);

        this.context[event.storage_destination]
        .update(event.identifier, highlights);
    }
}

abstract class Agent extends Storage {

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

        this._request_color.bind(this);
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
                // this.color_picker.dispose();
                resolve(
                    selection.iconPath.path
                    .replace(
                        `${this.base_dir}${this.colors_path}`, 
                        ''
                    ).replace('.png', '')
                );
            }.bind(this));
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

        /** Get name and color */
        const value: string =
        await this._request_text("Give a name for this highlight to find it again!");
        const hex: string =
        await this._request_color();

        /** Get Selection */
        const selection = window.activeTextEditor?.selection;
        if (!selection) {
            window.showInformationMessage("Please make a selection and try again.");
        }

        /** Broadcast */
        this.emitter.emit(
            UserCommands.HIGHLIGHT,
            {
                event: {
                    name: value,
                },
                selection,
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

declare abstract class DecorationTool extends Agent {
    constructor(context: ExtensionContext, registrar: Function);
    protected decorate(editor: any, message: CommandMessage): Promise<void>;
}

export class Highlighter extends DecorationTool {
    constructor(context: ExtensionContext, registrar: Function) {
        super(context, registrar);
        this.emitter.addListener(UserCommands.HIGHLIGHT, this.decorate);
    }
    protected async decorate(editor: any, message: CommandMessage): Promise<void> {
        editor.setDecorations(
            window.createTextEditorDecorationType(
                message.style,
            ),
            [message.selection],
        );
    }
}
