import { ExtensionContext } from "vscode";
import { MergedAggregates } from "@domain/MergedAggregates";

export type DomainKey = string;
export type DomainName = string;
export type ExtensionPath = string;
export type GlobalStoragePath = string;
export type GlobalStorageData<T extends MergedAggregates> = {
    content: T;
}