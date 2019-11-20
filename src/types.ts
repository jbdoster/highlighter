import {
    Location,
    Position,
    Range,
    Selection,
    Uri
} from 'vscode';

export interface Highlight {
    name: string;
    color: string;
    range: Range;
    uri: Uri;
    location: Location;
    focusPosition: Position;
    selection: Selection;
    startLine: number;
    startChar: number;
    endLine: number;
    endChar: number;
};