import { Event } from "vscode";
import { HighlightEvent, Highlight } from "@subdomains/Highlight/context/ContextMap";

export interface Gateway<E extends HighlightEvent> {
    add (event: E): Promise<void>;
    find (event: E): Promise<Highlight>;
    remove (event: E): Promise<void>;
    remove_all (event: E): Promise<void>;
}
