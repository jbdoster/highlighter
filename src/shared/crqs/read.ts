import { readFile } from "fs";
import { DomainKey } from "./types";
import { ExtensionContext } from "vscode";
import { LoadableItem } from "@shared/DomainContext";

export interface ReadInput {
    extension_context: ExtensionContext;
    item: LoadableItem;
}

export interface ReadModel<T extends LoadableItem> {
    workspace (input: ReadInput): Promise<T> | undefined;
    workspace_global_state (input: ReadInput): Promise<T> | undefined;
    workspace_global_storage (input: ReadInput): Promise<T> | undefined;
}

class Read<T extends LoadableItem> implements ReadModel<T> {
    constructor() {}
    workspace (input: ReadInput): Promise<T> | undefined {
        return input.extension_context.globalState.get(input.item.name);
    }
    workspace_global_state (input: ReadInput): Promise<T> | undefined {
        return input.extension_context.globalState.get(input.item.name);
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