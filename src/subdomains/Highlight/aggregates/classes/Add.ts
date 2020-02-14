import { TItem, DomainEvent } from "@shared/DomainContext";
import { IHighlightAggregateAdd } from "@subdomains/Highlight/aggregates/interfaces";
class Add<D extends DomainEvent<TItem>> implements IHighlightAggregateAdd<D> {
    async exec(event: D) {
        return Promise.resolve(undefined);
    }
}

export default Add;