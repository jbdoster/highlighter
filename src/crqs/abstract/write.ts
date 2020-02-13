import { DomainKey } from "@crqs/types";
import { MergedAggregates } from "@domain/MergedAggregates";

interface Write<T extends MergedAggregates> {
    cache (key: DomainKey, context: T): Promise<void>;
    fs (key: DomainKey, context: T): Promise<void>;
    workspace_state (key: DomainKey, context: T): Promise<void>;
}