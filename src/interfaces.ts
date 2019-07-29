import { Highlighter } from './classes';
import * as vscode from 'vscode';
export interface IHighlighter {
    highlightSelection (context: vscode.ExtensionContext): Promise<number>;
    findHighlight      (context: vscode.ExtensionContext): Promise<number>;
    removeHighlight    (context: vscode.ExtensionContext): Promise<number>;
    removeAllHighlights(context: vscode.ExtensionContext): Promise<number>;
    decorate           (editor: vscode.TextEditor, 
                        hexValue: string | vscode.ThemeColor, 
                        selection: vscode.Selection):      Promise<number>;

}
export interface Util {
}
export interface IHighlight {
        name: string;
        hexValue: string | vscode.ThemeColor;
        selection: vscode.Selection;
        uri: vscode.Uri;
}
export interface ISubscriber {
    onTextDocumentChangedHandler  (context: vscode.ExtensionContext,  event: vscode.TextDocumentChangeEvent, highlighter: Highlighter): Promise<number>;
    onActiveEditorDidChangeHandler(context: vscode.ExtensionContext,  editor: vscode.TextEditor,             highlighter: Highlighter): Promise<number>;
}