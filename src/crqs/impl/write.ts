// import { DomainKey, ExtensionPath, GlobalStoragePath } from "@crqs/types";
// import { ExtensionContext } from "vscode";
import { WriteModel } from "@crqs/abstract/write";
import { MergedAggregates } from "@domain/MergedAggregates";
import { WriteInput } from "@crqs/interfaces";
import { writeFile, write } from "fs";

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