import { writeFile } from "fs";
import { TDomainKey } from "@shared/DomainContext";
import { ExtensionContext } from "vscode";
import { StoreableItem } from "@shared/DomainContext";

export interface WriteInput {
    extension_context: ExtensionContext;
    item: StoreableItem;
}

export interface WriteModel<T extends StoreableItem> {
    workspace_state (context: ExtensionContext, input: T): Promise<void>;
    workspace_global_state (context: ExtensionContext, input: T): Promise<void>;
    workspace_global_storage (context: ExtensionContext, input: T): Promise<NodeJS.ErrnoException | void>;
}

class Write<T extends StoreableItem> implements WriteModel<T> {
    constructor() {}
    async workspace_state (context: ExtensionContext, item: T): Promise<void> {
        context.workspaceState.update(item.name, item);
        return undefined;
    }
    async workspace_global_state (context: ExtensionContext, item: T): Promise<void> {
        context.globalState.update(item.name, item);
        return undefined;
    }
    async workspace_global_storage (context: ExtensionContext, item: T): Promise<NodeJS.ErrnoException | void> {
        return new Promise(
        (resolve, reject) => {
            writeFile(
                context.globalStoragePath, 
                item.name,
                function(err: NodeJS.ErrnoException | null) {
                if (err) {
                    return reject(err);
                }
                else {
                    return resolve(undefined);
                }
                
            });
        });
    }
}

export default Write;