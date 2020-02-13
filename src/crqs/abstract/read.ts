import { DomainKey, ExtensionPath } from "@crqs/types";
import { ExtensionContext } from "vscode";
import { MergedAggregates } from "@domain/MergedAggregates";

export interface ReadModel<T extends MergedAggregates> {
    readonly extension_path: ExtensionPath;
    workspace (context: ExtensionContext, key: DomainKey): Promise<T> | undefined;
    workspace_global_state (context: ExtensionContext, key: DomainKey): Promise<T> | undefined;
    workspace_global_storage (context: ExtensionContext, key: DomainKey): Promise<T> | undefined;
}