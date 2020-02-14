import { TItem, DomainEvent } from "@shared/DomainContext";
import { IHighlightAggregateRemoveAll } from "@subdomains/Highlight/aggregates/interfaces";
class RemoveAll<D extends DomainEvent<TItem>> implements IHighlightAggregateRemoveAll<D> {
    async exec(event: D) {
        return Promise.resolve(undefined);
    }
}

export default RemoveAll;