import * as vscode from 'vscode';
import { Highlighter } from './classes';
export type IHighlight  = {
        name:      string;
        hexValue:  string | vscode.ThemeColor;
        selection: vscode.Selection;
        uri:       vscode.Uri;
};
export type IUpdateHighlight  = {
        appliedHighlight: string;
        updatedSelection: vscode.Selection;
};