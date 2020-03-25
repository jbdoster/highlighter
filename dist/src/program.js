"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const vscode_1 = require("vscode");
const fs_1 = require("fs");
var UserCommands;
(function (UserCommands) {
    UserCommands["HIGHLIGHT"] = "extension.highlightSelection";
    UserCommands["FIND_HIGHLIGHT"] = "FIND_HIGHLIGHT";
    UserCommands["REMOVE_HIGHLIGHT"] = "REMOVE_HIGHLIGHT";
    UserCommands["REMOVE_HIGHLIGHTS"] = "REMOVE_HIGHLIGHTS";
})(UserCommands = exports.UserCommands || (exports.UserCommands = {}));
class Base {
    constructor(context) {
        this.base_dir = context.extensionPath;
        this.colors_path = "src/resources/imgs/colors-picker";
        this.colors_dir_files = fs_1.readdirSync(`${this.base_dir}/${this.colors_path}`);
        this.preferences = {};
    }
}
class Agent extends Base {
    constructor(context, registrar) {
        super(context);
        this.context = context;
        this.emitter = new events_1.EventEmitter();
        this.emitter.emit.bind(this);
        this.color_picker = vscode_1.window.createQuickPick();
        this.color_picker.canSelectMany = false;
        this.color_picker.placeholder = 'Pick a color';
        this.color_buttons = [];
        for (const i in this.colors_dir_files) {
            this.color_buttons.push({
                iconPath: vscode_1.Uri.file(`${this.base_dir}${this.colors_path}${this.colors_dir_files[i]}`)
            });
            if (Number(i) === this.colors_dir_files.length - 1) {
                this.color_picker.buttons = this.color_buttons;
            }
        }
        this._input_box = vscode_1.window.createInputBox();
        this._input_box.onDidAccept.bind(this);
        registrar(UserCommands.HIGHLIGHT, () => {
            this._workflow_highlight();
        });
    }
    _request_color() {
        return __awaiter(this, void 0, void 0, function* () {
            this.color_picker.show();
            return new Promise((resolve) => {
                this.color_picker.onDidTriggerButton(function (selection) {
                    this.color_picker.dispose();
                    resolve(selection.iconPath.path
                        .replace(`${this.base_dir}/${this.colors_path}`, '').replace('.png', ''));
                });
            });
        });
    }
    _request_text(title) {
        this._input_box.title = title;
        this._input_box.show();
        return new Promise((resolve) => {
            this._input_box.onDidAccept(function () {
                resolve(this._input_box.value);
            }.bind(this));
        });
    }
    _workflow_highlight() {
        return __awaiter(this, void 0, void 0, function* () {
            const value = yield this._request_text("Give a name for this highlight to find it again!");
            const hex = yield this._request_color();
            this.emitter.emit(UserCommands.HIGHLIGHT, {
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
            });
        });
    }
}
class DecorationTool extends Agent {
    constructor(context, registrar) {
        super(context, registrar);
    }
    decorate(style) {
        console.log(style);
    }
}
class Highlighter extends DecorationTool {
    constructor(context, registrar) {
        super(context, registrar);
        this.emitter.addListener(UserCommands.HIGHLIGHT, this.decorate);
    }
    decorate(event) {
        const e = event;
    }
}
exports.Highlighter = Highlighter;
//# sourceMappingURL=program.js.map