// import { DomainKey, ExtensionPath } from "@crqs/types";
// import { ExtensionContext } from "vscode";
import { BoundedContexts } from "@shared/types";
import { ReadInput } from "@crqs/interfaces";
import { Context } from "@subdomains/Highlight/ContextMap";

export interface ReadModel<C extends BoundedContexts> {
    workspace (input: ReadInput): Promise<C> | undefined;
    workspace_global_state (input: ReadInput): Promise<C> | undefined;
    workspace_global_storage (input: ReadInput): Promise<C> | undefined;
}