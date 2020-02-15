import { Event, EventBus } from "@shared/types";
import { IHighlightAggregateAdd } from "../interfaces";

class Add<E extends Event<EventBus>> implements IHighlightAggregateAdd<E> {
    async exec(event: E) {
        return Promise.resolve(undefined);
    }
}

export default Add;