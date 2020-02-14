import { DomainEvent } from "@shared/DomainContext";
import { TItem } from "@shared/DomainContext";

export interface IHighlightAggregateAdd<D extends DomainEvent<TItem>> { // IDomainAggregateFunctionality
    exec(event: D): Promise<void>;
}
export interface IHighlightAggregateFind<D> {
    exec(event: D): Promise<TItem | undefined>;
}
export interface IHighlightAggregateRemove<D> {
    exec(event: D): Promise<void>;
}
export interface IHighlightAggregateRemoveAll<D> {
    exec(event: D): Promise<void>;
}