import * as vscode from 'vscode';
import { Highlighter } from './classes';
export type IHighlight  = {
        name:      string;
        hexValue:  string | vscode.ThemeColor;
        selection: vscode.Selection;
        uri:       vscode.Uri;
};
// export type IHighlightQueueInput = { 
//     event:       vscode.TextDocumentChangeEvent;
//     highlighter: Highlighter;
//     type:        string;
// };