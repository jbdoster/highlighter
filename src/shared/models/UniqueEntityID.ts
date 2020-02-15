import { TUniqueEntityID } from "@shared/types";

class UniqueEntityID {
    private readonly value: Symbol;
    constructor(id: TUniqueEntityID | undefined) {
        this.value = 
        id ? id :
        Symbol("id");
    }
}

export default UniqueEntityID;