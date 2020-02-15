import Add from "@subdomains/Highlight/aggregates/classes/Add";
import Find from "@subdomains/Highlight/aggregates/classes/Find";
import Remove from "@subdomains/Highlight/aggregates/classes/Remove";
import RemoveAll from "@subdomains/Highlight/aggregates/classes/RemoveAll";
import { IHighlightAggregateAdd, IHighlightAggregateFind, IHighlightAggregateRemove, IHighlightAggregateRemoveAll } from "./aggregates/interfaces";
import { Event, EventBus, DecoratableItem } from "@shared/types";

export enum Commands {
    ADD = "extension.highlightLines",
    FIND = "extension.finMarkerTool",
    REMOVE = "extension.removeHighlight",
    REMOVE_ALL = "extension.removeAllHighlights"
}

export type Highlight = DecoratableItem;

interface Model<E extends Event<EventBus>> {
    add: IHighlightAggregateAdd<E>;
    find: IHighlightAggregateFind<E>;
    remove: IHighlightAggregateRemove<E>;
    remove_all: IHighlightAggregateRemoveAll<E>;
}

class MarkerTool<E extends Event<EventBus>>
implements Model<E> {

    readonly add: IHighlightAggregateAdd<E>;
    readonly find: IHighlightAggregateFind<E>;
    readonly remove:  IHighlightAggregateAdd<E>;
    readonly remove_all:  IHighlightAggregateAdd<E>;

    constructor(registerCommand: Function) {
        
        this.add = new Add();
        this.find = new Find();
        this.remove = new Remove();
        this.remove_all = new RemoveAll();

        registerCommand(Commands.ADD, (event: E) => {
        }).bind(this);
        registerCommand(Commands.FIND, (event: E) => {
        }).bind(this);
        registerCommand(Commands.REMOVE, (event: E) => {
        }).bind(this);
        registerCommand(Commands.REMOVE_ALL, (event: E) => {
        }).bind(this);

    }
}

export default MarkerTool;
