import { readFile } from "fs";
import { ExtensionContext } from "vscode";
import { EventBus } from "@shared/types";

export interface ReadInput {
    extension_context: ExtensionContext;
    items: EventBus;
}

export interface ReadModel<T extends EventBus> {
    workspace (input: ReadInput): Promise<T> | undefined;
    workspace_global_state (input: ReadInput): Promise<T> | undefined;
    workspace_global_storage (input: ReadInput): Promise<T> | undefined;
}

class Read<T extends EventBus> implements ReadModel<T> {
    constructor() {}
    workspace (input: ReadInput): Promise<T> | undefined { // TODO handle batches
        const batch: T | undefined = [];
        for (const item of input.items) {
            batch.push(
                input.extension_context.globalState.get(item.);
            );
        }
    }
    workspace_global_state (input: ReadInput): Promise<T> | undefined {
        return input.extension_context.globalState.get(input.item.id);
    }
    workspace_global_storage (input: ReadInput): Promise<T> | undefined {
        return new Promise(
            (resolve, reject) => {
                readFile(
                    input.extension_context.globalStoragePath + input.item.name,
                    function(err: NodeJS.ErrnoException | null, data: Buffer) {
                    if (err) {
                        return reject(err);
                    }
                    else {
                        if (data) {
                            const aggregate: T = JSON.parse(data.toString());
                            return resolve(aggregate);
                        }
                        else {
                            return resolve(undefined);
                        }
                    }
                    
                });
            });
    }
}

export default Read;