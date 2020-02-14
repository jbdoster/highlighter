// import { DomainKey, ExtensionPath } from "@crqs/types";
// import { ExtensionContext } from "vscode";
import { BoundedContexts } from "@shared/types";
import { writeFile } from "fs";
import { DomainKey } from "./types";
import { ExtensionContext } from "vscode";

export interface WriteInput<T extends MergedAggregates> {
    aggregate: T;
    extension_context: ExtensionContext;
    key: DomainKey;
}

export interface WriteModel<C extends BoundedContexts> {
    workspace_state (input: WriteInput<C>): Promise<void>;
    workspace_global_state (input: WriteInput<C>): Promise<void>;
    workspace_global_storage (input: WriteInput<C>): Promise<NodeJS.ErrnoException | void>;
}

class Write<T extends MergedAggregates> implements WriteModel<T> {
    constructor() {}
    async workspace_state (input: WriteInput<T>): Promise<void> {
        input.extension_context.workspaceState.update(input.key, input.aggregate);
        return undefined;
    }
    async workspace_global_state (input: WriteInput<T>): Promise<void> {
        input.extension_context.globalState.update(input.key, input.aggregate);
        return undefined;
    }
    async workspace_global_storage (input: WriteInput<T>): Promise<NodeJS.ErrnoException | void> {
        return new Promise(
        (resolve, reject) => {
            writeFile(
                input.extension_context.globalStoragePath, 
                input.aggregate,
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