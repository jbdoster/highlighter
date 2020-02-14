import { TItem, DomainEvent } from "@shared/DomainContext";
import { IHighlightAggregateFind } from "@subdomains/Highlight/aggregates/interfaces";
class Find<D extends DomainEvent<TItem>> implements IHighlightAggregateFind<D> {
    async exec(event: D) {
        return Promise.resolve(undefined);
    }
}

export default Find;