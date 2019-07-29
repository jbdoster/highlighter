import * as vscode from 'vscode';
export interface IHighlighter {
    highlightSelection (context: vscode.ExtensionContext): Promise<number>;
    findHighlight      (context: vscode.ExtensionContext): Promise<number>;
    removeHighlight    (context: vscode.ExtensionContext): Promise<number>;
    removeAllHighlights(context: vscode.ExtensionContext): Promise<number>;
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
    onTextDocumentChangedHandler  (context: vscode.ExtensionContext, event: vscode.TextDocumentChangeEvent): Promise<number>;
    onActiveEditorDidChangeHandler(context: vscode.ExtensionContext                                       ): Promise<number>;
}