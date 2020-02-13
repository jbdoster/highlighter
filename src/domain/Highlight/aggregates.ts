import { Event } from "vscode";
import { HighlightEvent, Highlight } from "@domain/Highlight/context";

export interface HighlightAggregateRoot<T extends HighlightEvent | Highlight> {
    events_: Event<T>;
    add (event: T): Promise<void>;
    find (event: T): Promise<T>;
    remove (event: T): Promise<void>;
    remove_all (event: T): Promise<void>;
}
