// import { Gateway } from "@subdomains/Highlight/context/Model";
import { Commands } from "@subdomains/Highlight/Context";
import Add from "@subdomains/Highlight/aggregates/classes/Add";
import Find from "@subdomains/Highlight/aggregates/classes/Find";
import Remove from "@subdomains/Highlight/aggregates/classes/Remove";
import RemoveAll from "@subdomains/Highlight/aggregates/classes/RemoveAll";

import { Memento } from "vscode";
import { TItem, DomainEvent } from "@shared/DomainContext";
import { IHighlightAggregateAdd, IHighlightAggregateFind, IHighlightAggregateRemove, IHighlightAggregateRemoveAll } from "./aggregates/interfaces";

interface Model<E extends DomainEvent<TItem>> {
    add: IHighlightAggregateAdd<E>;
    find: IHighlightAggregateFind<E>;
    remove: IHighlightAggregateRemove<E>;
    remove_all: IHighlightAggregateRemoveAll<DomainEvent<TItem>>;
}

class DHighlight<E extends DomainEvent<TItem>>
implements Model<E> {

    readonly add: IHighlightAggregateAdd<DomainEvent<TItem>>;
    readonly find: IHighlightAggregateFind<DomainEvent<TItem>>;
    readonly remove:  IHighlightAggregateAdd<DomainEvent<TItem>>;
    readonly remove_all:  IHighlightAggregateAdd<DomainEvent<TItem>>;

    constructor(registerCommand: Function) {
        
        this.add = new Add();
        this.find = new Find();
        this.remove = new Remove();
        this.remove_all = new RemoveAll();

        registerCommand(Commands.ADD, (event: DomainEvent<TItem>) => {
        }).bind(this);
        registerCommand(Commands.FIND, (event: DomainEvent<TItem>) => {
        }).bind(this);
        registerCommand(Commands.REMOVE, (event: DomainEvent<TItem>) => {
        }).bind(this);
        registerCommand(Commands.REMOVE_ALL, (event: DomainEvent<TItem>) => {
        }).bind(this);

    }
}

export default DHighlight;
