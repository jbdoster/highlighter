import { DomainKey, ExtensionPath } from "@crqs/types";
import { ExtensionContext } from "vscode";
import { ReadModel } from "@crqs/abstract/read";
import { MergedAggregates } from "@domain/MergedAggregates";
import { ReadInput } from "@crqs/interfaces";
import { readFile } from "fs";

class Read<T extends MergedAggregates> implements ReadModel<T> {
    readonly extension_path: ExtensionPath;
    constructor(context: ExtensionContext) {
        this.extension_path = context.extensionPath;
    }
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