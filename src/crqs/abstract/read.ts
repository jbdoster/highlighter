import { DomainKey, ExtensionPath } from "@crqs/types";
import { ExtensionContext } from "vscode";
import { MergedAggregates } from "@domain/MergedAggregates";
import { ReadInput } from "@crqs/interfaces";

export interface ReadModel<T extends MergedAggregates> {
    workspace (input: ReadInput): Promise<T> | undefined;
    workspace_global_state (input: ReadInput): Promise<T> | undefined;
    workspace_global_storage (input: ReadInput): Promise<T> | undefined;
}