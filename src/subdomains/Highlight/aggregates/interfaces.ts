import { Event, EventBus } from "@shared/types";

export interface IHighlightAggregateAdd<E extends Event<EventBus>> {
    exec(event: E): Promise<void>;
}
export interface IHighlightAggregateFind<E extends Event<EventBus>> {
    exec(event: E): Promise<E | undefined>;
}
export interface IHighlightAggregateRemove<E extends Event<EventBus>> {
    exec(event: E): Promise<void>;
}
export interface IHighlightAggregateRemoveAll<E extends Event<EventBus>> {
    exec(event: E): Promise<void>;
}