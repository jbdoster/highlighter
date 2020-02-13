// import { DomainKey, ExtensionPath } from "@crqs/types";
// import { ExtensionContext } from "vscode";
import { MergedAggregates } from "@domain/MergedAggregates";
import { WriteInput } from "@crqs/interfaces";

export interface WriteModel<T extends MergedAggregates> {
    workspace_state (input: WriteInput<T>): Promise<void>;
    workspace_global_state (input: WriteInput<T>): Promise<void>;
    workspace_global_storage (input: WriteInput<T>): Promise<NodeJS.ErrnoException | void>;
}