import { TUniqueEntityID, Event, EventBus, Properties } from "@shared/types";
import UniqueEntityID from "./UniqueEntityID";

export abstract class Entity<E extends Event<EventBus>> {
  protected readonly _id: UniqueEntityID;

  constructor (id?: UniqueEntityID) {
    this._id = id ? id : new UniqueEntityID(undefined);
  }

  public equals (object?: Entity<E>): boolean {

    if (object === null || object === undefined) {
      return false;
    }

    if (this === object) { return true; }
    else { return false; }
  }
}