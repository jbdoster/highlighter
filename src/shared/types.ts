// import { Location, Position, Range, Selection, Uri, EventEmitter, TextEditor } from "vscode";
import * as HighlightDomain from "@subdomains/Highlight/ContextMap";

export enum CqrsOp {
    READ = "read",
    WRITE = "write"
}

export enum Domain {
    HIGHLIGHT = "Highlight"
}

export type BoundedContexts = HighlightDomain.Context; // | Font | etc.