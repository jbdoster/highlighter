import { Highlighter } from './classes';
import * as vscode from 'vscode';
export interface IHighlighter {
    highlightSelection (context:   vscode.ExtensionContext): Promise<number>;
    findHighlight      (context:   vscode.ExtensionContext): Promise<number>;
    removeHighlight    (context:   vscode.ExtensionContext): Promise<number>;
    removeAllHighlights(context:   vscode.ExtensionContext): Promise<number>;
    decorate           (editor:    vscode.TextEditor, 
                        hexValue:  string | vscode.ThemeColor, 
                        selection: vscode.Selection): Promise<number>;

}
export interface ISubscriber {
    onActiveEditorDidChangeHandler(context:     vscode.ExtensionContext,  
                                   editor:      vscode.TextEditor,             
                                   highlighter: Highlighter): Promise<void>;
}
// export interface IHighlightQueueInput { 
//     event:       vscode.TextDocumentChangeEvent;
//     highlighter: Highlighter;
//     type:        string;
// }
export interface IUpdateHighlight {
    appliedHighlight: string;
    updatedSelection: vscode.Selection;
}