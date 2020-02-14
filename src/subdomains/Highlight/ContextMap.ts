import { CqrsOp, BoundedContexts } from "@shared/types";
import Read from "@shared/crqs/read";
import Write from "@shared/crqs/write";
import { Location, Memento, Position, Range, Selection, Uri } from "vscode";

type Key = string;
type EventName = string;
type Finder<T extends Memento> = T;
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

// export type Context = {
//     highlight: Highlight;
//     key: Key;
// };

export enum Commands {
    ADD = "extension.highlightLines",
    FIND = "extension.findHighlight",
    REMOVE = "extension.removeHighlight",
    REMOVE_ALL = "extension.removeAllHighlights"
}

export type Registrar = Function;

export type HighlightEvent<T extends BoundedContexts | Memento> = {
    event_name: EventName;
    read: Read<T>; // cqrs
    write: Write<T>; // cqrs
    finder: Finder<T>; // wrap workspace data getters
};
