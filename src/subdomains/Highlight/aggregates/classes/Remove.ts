import { TItem, DomainEvent } from "@shared/DomainContext";
import { IHighlightAggregateRemove } from "@subdomains/Highlight/aggregates/interfaces";
class Remove<D extends DomainEvent<TItem>> implements IHighlightAggregateRemove<D> {
    async exec(event: D) {
        return Promise.resolve(undefined);
    }
}

export default Remove;