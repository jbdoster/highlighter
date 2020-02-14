import Read from "@shared/crqs/read";
import Write from "@shared/crqs/write";
import { DecoratableItem, StoreableItem, LoadableItem } from "@shared/DomainContext";

export enum Commands {
    ADD = "extension.highlightLines",
    FIND = "extension.findHighlight",
    REMOVE = "extension.removeHighlight",
    REMOVE_ALL = "extension.removeAllHighlights"
}

export type Highlight = DecoratableItem | StoreableItem | LoadableItem;