// import { Gateway } from "@subdomains/Highlight/context/Model";
import { Commands, Context, Highlight, HighlightEvent } from "@subdomains/Highlight/Context";
import { Memento } from "vscode";
import { CQRS } from "@shared/DomainContext";

export interface Gateway<E extends HighlightEvent<Memento>> {
    add (event: E): Promise<void>;
    find (event: E): Promise<Highlight | void>;
    remove (event: E): Promise<void>;
    remove_all (event: E): Promise<void>;
}



class HighlightModel<E extends HighlightEvent<Memento>> 
implements Gateway<E> {
    private readonly store: CQRS<Context>;
    constructor(registerCommand: Function) {

        registerCommand(Commands.ADD, (event: E) => {
            this.add(event);
        }).bind(this);
        registerCommand(Commands.FIND, (event: E) => {
            this.find(event);
        }).bind(this);
        registerCommand(Commands.REMOVE, (event: E) => {
            this.find(event);
        }).bind(this);
        registerCommand(Commands.REMOVE_ALL, (event: E) => {
            this.find(event);
        }).bind(this);

    }
    async add (event: E): Promise<void> {
        return undefined;
    }
    async find (event: E): Promise<Highlight | void> {
        return event.finder.get(event.context.key);
    }
    async remove (event: E): Promise<void> {
        return undefined;
    }
    async remove_all (event: E): Promise<void> {
        return undefined;
    }
}



export default HighlightModel;