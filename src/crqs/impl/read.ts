// import { DomainKey, ExtensionPath } from "@crqs/types";
import { BoundedContexts } from "@shared/types";
import { ExtensionContext } from "vscode";
import { ReadModel } from "@crqs/abstract/read";
import { ReadInput } from "@crqs/interfaces";
import { readFile } from "fs";

class Read<T extends BoundedContexts> implements ReadModel<T> {
    constructor() {}
    workspace (input: ReadInput): Promise<T> | undefined {
        return input.extension_context.globalState.get(input.key);
    }
    workspace_global_state (input: ReadInput): Promise<T> | undefined {
        return input.extension_context.globalState.get(input.key);
    }
    workspace_global_storage (input: ReadInput): Promise<T> | undefined {
        return new Promise(
            (resolve, reject) => {
                readFile(
                    input.extension_context.globalStoragePath,
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