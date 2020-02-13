import { DomainKey } from "./types";
import { ExtensionContext } from "vscode";
import { MergedAggregates } from "@shared/MergedAggregates";

export interface ReadInput {
    extension_context: ExtensionContext;
    key: DomainKey;
}

export interface WriteInput<T extends MergedAggregates> {
    aggregate: T;
    extension_context: ExtensionContext;
    key: DomainKey;
}
