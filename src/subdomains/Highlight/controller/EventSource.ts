import { Gateway } from "../context/BoundedContext";
import { Commands, HighlightEvent } from "../context/ContextMap";

class HighlightController<E extends HighlightEvent> implements Gateway<E> {
    constructor(registerCommand: Function) {

        this.add.bind(this);
        this.find.bind(this);
        this.remove.bind(this);
        this.remove_all.bind(this);

        registerCommand(Commands.ADD, function (event: E) {
            this.add(event);
        }.bind(this));
        registerCommand(Commands.FIND, () => {});
        registerCommand(Commands.REMOVE, () => {});
        registerCommand(Commands.REMOVE_ALL, () => {});
    }
    async add (event: E): Promise<void> {
        return undefined;
    }
    async find (event: E): Promise<Highlight> {
    }
    async remove (event: E): Promise<void> {
        return undefined;
    }
    async remove_all (event: E): Promise<void> {
        return undefined;
    }
}