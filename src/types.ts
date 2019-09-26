import {
        Selection,
        ThemeColor,
        Uri
} from 'vscode';

export type Highlight = {
        name: string;
        selection: Selection;
        theme: ThemeColor;
        uri: Uri;
};
