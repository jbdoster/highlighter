import { DomainKey, ExtensionPath } from "@crqs/types";
import { ExtensionContext } from "vscode";
import { ReadModel } from "@crqs/abstract/read";
import { MergedAggregates } from "@domain/MergedAggregates";

class Read<T extends MergedAggregates> implements ReadModel<T> {
    readonly extension_path: ExtensionPath;
    constructor(context: ExtensionContext) {
        this.extension_path = context.extensionPath;
    }
    workspace (context: ExtensionContext, key: DomainKey): Promise<T> | undefined {
        return context.globalState.get(key);
    }
    workspace_global_state (context: ExtensionContext, key: DomainKey): Promise<T> | undefined {
        return context.globalState.get(key);
    }
    workspace_global_storage (context: ExtensionContext, key: DomainKey): Promise<T> | undefined {
        return context.globalState.get(key);
    }
}
