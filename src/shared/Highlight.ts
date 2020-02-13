import { Location, Position, Range, Selection, Uri } from "vscode";

type HighlightColorHex = string;
type HighlightColorName = string;
type HighlightColor = {
    HighlightColorHex: HighlightColorHex,
    HighlightColorName: HighlightColorName
};
type HighlightEndChar = number;
type HighlightEndLine = number;
type HighlightLocation = Location;
type HighlightName = string;
type HighlightPosition = Position;
type HighlightRange = Range;
type HighlightSelection = Selection;
type HighlightStartChar = number;
type HighlightStartLine = number;
type HighlightUri = Uri;

export type Highlight = {
    color: HighlightColor,
    endChar: HighlightEndChar
    endLine: HighlightEndLine,
    location: HighlightLocation,
    name: HighlightName,
    position: HighlightPosition,
    range: HighlightRange,
    selection: HighlightSelection,
    startChar: HighlightStartChar,
    startLine: HighlightStartLine,
    uri: HighlightUri,
};
