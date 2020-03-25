"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const vscode_1 = require("vscode");
var UserCommands;
(function (UserCommands) {
    UserCommands["HIGHLIGHT"] = "extension.highlightSelection";
    UserCommands["FIND_HIGHLIGHT"] = "FIND_HIGHLIGHT";
    UserCommands["REMOVE_HIGHLIGHT"] = "REMOVE_HIGHLIGHT";
    UserCommands["REMOVE_HIGHLIGHTS"] = "REMOVE_HIGHLIGHTS";
})(UserCommands = exports.UserCommands || (exports.UserCommands = {}));
exports.COLORS_PATH = 'resources/imgs/colors-picker/';
class Base {
    constructor() {
        this.preferences = {};
    }
}
class Agent extends Base {
    constructor(context, registrar) {
        super();
        this.context = context;
        this.emitter = new events_1.EventEmitter();
        this.emitter.emit.bind(this);
        this.picker = vscode_1.window.createQuickPick();
        registrar(UserCommands.HIGHLIGHT, (event) => {
            this.emitter.emit(UserCommands.HIGHLIGHT, event);
        });
    }
    respond(event) {
        console.log(event);
    }
}
class DecorationTool extends Agent {
    constructor(context, registrar) {
        super(context, registrar);
    }
    decorate(event) {
        console.log(event);
    }
}
class Highlighter extends DecorationTool {
    constructor(context, registrar) {
        super(context, registrar);
        this.emitter.addListener(UserCommands.HIGHLIGHT, this.decorate);
    }
    decorate(event) {
        event;
    }
}
exports.Highlighter = Highlighter;
//# sourceMappingURL=program.js.map