import { UserProperties } from "@shared/types";

class User {
    public readonly properties: UserProperties;
    constructor(properties: UserProperties) {
        this.properties = properties;
    }
}

export default User;
