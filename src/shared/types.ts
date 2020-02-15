import MarkerTool, { Highlight } from "@subdomains/Highlight/Model";
import { Location, Position, Range, Selection, Uri } from "vscode";

/** VS Code Aliasing */
export type Literal = string | Buffer | Symbol;
export type ColorHex = string;
export type ColorName = string;
export type Color = {
    TColorHex: ColorHex,
    ColorName: ColorName
};
export type EndChar = number;
export type EndLine = number;
export type Name = string;
export type StartChar = number;
export type StartLine = number;

/** User Preferences */
type BoolWholeLine = boolean;
type BoolTelemetry = boolean;
type UserPreference = BoolWholeLine | BoolTelemetry;
type UserPreferences = {
    [key: string]: UserPreference;
};
export type UserProperties = {
    preferences: UserPreferences;
};
export type Properties = {
    user: UserProperties;
};

/** Events */
type DecoratableItemId = string;
export type DecoratableItem = {
    id :DecoratableItemId;
    color: Color,
    endChar: EndChar
    endLine: EndLine,
    location: Location,
    name: Name,
    position: Position,
    range: Range,
    selection: Selection,
    startChar: StartChar,
    startLine: StartLine,
    uri: Uri, 
};

type EventPropertyValue = string | {};
type ItemId = string;
export type LoadableItem = { id: ItemId; [key: string]: EventPropertyValue; };
export type StoreableItem = { id: ItemId; [key: string]: EventPropertyValue; };
export type EventBus = DecoratableItem[] | LoadableItem[] | StoreableItem[];
export type Event<T extends EventBus> = {
    properties: T[];
};

export type TUniqueEntityID = Symbol;
// export type Entity<E extends Event<EventBus>> = MarkerTool<E>;
