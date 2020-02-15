import { Event, EventBus } from "@shared/types";
import { IHighlightAggregateAdd } from "../interfaces";

class Remove<E extends Event<EventBus>> implements IHighlightAggregateAdd<E> {
    async exec(event: E) {
        return Promise.resolve(undefined);
    }
}

export default Remove;