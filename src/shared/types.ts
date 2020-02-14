import { Location, Position, Range, Selection, Uri } from "vscode";

type TColorHex = string;
type TColorName = string;
type TColor = {
    TColorHex: TColorHex,
    ColorName: TColorName
};
type TEndChar = number;
type TEndLine = number;
type TLocation = Location;
type TName = string;
type TPosition = Position;
type TRange = Range;
type TSelection = Selection;
type TStartChar = number;
type TStartLine = number;
type TUri = Uri;

export type DecoratableItem = { // Highlight, font section, etc.
    color: TColor,
    endChar: TEndChar
    endLine: TEndLine,
    location: TLocation,
    name: TName,
    position: TPosition,
    range: TRange,
    selection: TSelection,
    startChar: TStartChar,
    startLine: TStartLine,
    uri: TUri,
};
