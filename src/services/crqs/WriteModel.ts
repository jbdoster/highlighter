import { writeFile } from "fs";
import { ExtensionContext } from "vscode";
import { EventBus } from "@shared/types";

export interface WriteInput {
    extension_context: ExtensionContext;
    items: EventBus;
}

export interface WriteModel<T extends EventBus> {
    workspace_state (input: WriteInput): Promise<void>;
    workspace_global_state (input: WriteInput): Promise<void>;
    workspace_global_storage (input: WriteInput): Promise<NodeJS.ErrnoException | void>;
}

class Write<T extends EventBus> implements WriteModel<T> {
    constructor() {}
    async workspace_state (input: WriteInput): Promise<void> {
        for (const item of input.items) {
            input.extension_context.workspaceState.update(item.id, item);
        }
        return undefined;
    }
    async workspace_global_state (input: WriteInput): Promise<void> {
        for (const item of input.items) {
            input.extension_context.globalState.update(item.id, item);
        }
        return undefined;
    }
    async workspace_global_storage (input: WriteInput): Promise<void> {
        const promises: Promise<NodeJS.ErrnoException | null>[] = [];
        for (const item of input.items) {
            promises.push(
            new Promise(
                (resolve, reject) => {
                    writeFile(
                        input.extension_context.globalStoragePath, 
                        item.name,
                        function(err: NodeJS.ErrnoException | null) {
                        if (err) {
                            return reject(err);
                        }
                        else {
                            return resolve(undefined);
                        }
                        
                    });
                })
            );
        }
        const results = await Promise.all(promises);
        return Promise.resolve(undefined);
    }
}

export default Write;