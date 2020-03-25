import { EventEmitter } from "events";
import { Selection, DecorationRenderOptions, QuickPickItem, QuickPick, window, ExtensionContext } from "vscode";

export enum UserCommands {
    HIGHLIGHT = "extension.highlightSelection",
    FIND_HIGHLIGHT = "FIND_HIGHLIGHT",
    REMOVE_HIGHLIGHT = "REMOVE_HIGHLIGHT",
    REMOVE_HIGHLIGHTS = "REMOVE_HIGHLIGHTS",
}

export type Picker = QuickPick<QuickPickItem>;
export type Preferences = {};

export type Style = DecorationRenderOptions;
export type Decoration = {
    selection: Selection;
    style: Style;
};

export interface EventMessage {
    decoration: Decoration;
    event: any;
}

export const COLORS_PATH = 'resources/imgs/colors-picker/';

abstract class Base {
    private preferences: Preferences;
    constructor() {
        this.preferences = {};
    }
}

abstract class Agent extends Base {

    protected context: ExtensionContext;
    protected emitter: EventEmitter;
    protected picker: Picker; 

    constructor(context: ExtensionContext, registrar: Function) {
        
        super();

        this.context = context;
        this.emitter = new EventEmitter();
        this.emitter.emit.bind(this);

        this.picker = window.createQuickPick();

        registrar(
            UserCommands.HIGHLIGHT, 
            (event: any) => {
                this.emitter.emit(
                    UserCommands.HIGHLIGHT,
                    event
                );
            }
        );

    }
    protected respond(event: any) {
        console.log(event);
    }
}

abstract class DecorationTool extends Agent {
    constructor(context: ExtensionContext, registrar: Function) {
        super(context, registrar);
    }
    decorate(event: any) {
        console.log(event);
    }
}

export class Highlighter extends DecorationTool {
    constructor(context: ExtensionContext, registrar: Function) {
        super(context, registrar);
        this.emitter.addListener(UserCommands.HIGHLIGHT, this.decorate);
    }
    decorate(event: any) {
        event;
    }
}