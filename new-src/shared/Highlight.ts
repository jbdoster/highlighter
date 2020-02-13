import { Location, Position, Range, Selection, Uri } from "vscode";

type HighlightColor = string;
type HighlightEndLine = number;
type HighlightEndChar = number;
type HighlightHex = string;
type HighlightLocation = Location;
type HighlightName = string;
type HighlightPosition = Position;
type HighlightRange = Range;
type HighlightSelection = Selection;
type HighlightStartLine = number;
type HighlightStartChar = number;
type HighlightUri = Uri;

type Highlight = {
    name: HighlightName,
    color: HighlightHex,
    range: HighlightRange,
    uri: HighlightUri,
    location: HighlightLocation,
    focusPosition: HighlightPosition,
    selection: HighlightSelection,
    startLine: HighlightStartLine,
    startChar: HighlightStartChar,
    endLine: HighlightEndLine,
    endChar: HighlightEndChar
}