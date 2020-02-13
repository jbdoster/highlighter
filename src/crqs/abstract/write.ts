// import { DomainKey, ExtensionPath } from "@crqs/types";
// import { ExtensionContext } from "vscode";
import { WriteInput } from "@crqs/interfaces";
import { BoundedContexts } from "@shared/types";

export interface WriteModel<C extends BoundedContexts> {
    workspace_state (input: WriteInput<C>): Promise<void>;
    workspace_global_state (input: WriteInput<C>): Promise<void>;
    workspace_global_storage (input: WriteInput<C>): Promise<NodeJS.ErrnoException | void>;
}