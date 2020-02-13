import { Event } from "vscode";
import { Context } from "src/subdomains/Highlight/ContextMap";

export interface Gateway<T extends Context> {
    events_: Event<T>;
    add (event: T): Promise<void>;
    find (event: T): Promise<T>;
    remove (event: T): Promise<void>;
    remove_all (event: T): Promise<void>;
}
