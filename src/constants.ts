import {
    DecorationRenderOptions,
    Location,
    Position,
    Range,
    Selection
} from 'vscode';

/** VAR */
export const decorationTypeOptions: DecorationRenderOptions = {
    isWholeLine: true,
    light: {
        backgroundColor: "#9fbfdf",
    },
    dark: {
        backgroundColor: "#9fbfdf",
    },
};
export const COLORS_PATH = 'resources/imgs/colors-picker/';

/** TYPE */
export type Highlight = {
    name: string;
    color: string;
    range: Range;
    uri: string;
    location: Location;
    focusPosition: Position;
    selection: Selection;
    startLine: number;
    startChar: number;
    endLine: number;
    endChar: number;
};