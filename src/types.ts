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
    uri: Uri;
    location: Location;
    focusPosition: Position;
    startLine: number;    // adjusts
    startChar: number;    // adjusts
    endLine: number;      // adjusts
    endChar: number;      // adjusts
}

export interface DisplacedHighlight {
    name: string;
    startLine: number;    // adjusts
    startChar: number;    // adjusts
    endLine: number;      // adjusts
    endChar: number;      // adjusts
    uri: Uri;
}

export interface DisplacedHighlightsQueue {
    [key: string]: DisplacedHighlight; // "index type https://www.typescriptlang.org/docs/handbook/advanced-types.html#intersection-types"
}