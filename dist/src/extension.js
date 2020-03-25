"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __importStar(require("vscode"));
const program_1 = require("./program");
function activate(context) {
    const highlighter = new program_1.Highlighter(context, vscode.commands.registerCommand);
    // let highlightFolder = vscode.commands.registerCommand('extension.highlightFolder', () => {
    // 	let workspaceEditor: vscode.WorkspaceEdit = new vscode.WorkspaceEdit();
    // });
    // let findHighlight = vscode.commands.registerCommand('extension.findHighlight', () => {
    // 	highlighter.findHighlight(context);
    // });
    // let removeHighlight = vscode.commands.registerCommand('extension.removeHighlight', () => {
    // 	highlighter.removeHighlight(context);
    // });
    // let removeAllHighlights = vscode.commands.registerCommand('extension.removeAllHighlights', () => {
    // 	highlighter.removeAllHighlights(context);
    // });
    // context.subscriptions.push( 
    // 							highlightLines, 
    // 							highlightFolder, 
    // 							findHighlight, 
    // 							removeHighlight, 
    // 							removeAllHighlights
    // 							);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map