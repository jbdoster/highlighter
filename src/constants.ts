import * as vscode from 'vscode';
export const decorationTypeOptions: vscode.DecorationRenderOptions = {
    isWholeLine: true,
    light: {
        backgroundColor: "#9fbfdf",
    },
    dark: {
        backgroundColor: "#9fbfdf",
    },
};
export const COLORS_PATH = 'resources/imgs/colors-picker/';
export const HIGHLIGHTS_KEY: string = '_highlights';