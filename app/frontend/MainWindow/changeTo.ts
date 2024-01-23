import { AppArea, selectedApp } from "./app";
import type { Observable } from "../../logic/util/Observable";
import { Person } from "../../logic/Abstract/Person";
import { selectedPerson } from "../Shared/Person/PersonOrGroup";
import { NotImplemented } from "../../logic/util/util";

export function openUIFor(obj: Observable) {
  if (obj instanceof Person) {
    selectedPerson.set(obj);
    selectedApp.set(AppArea.Contacts);
    return;
  }
  throw new NotImplemented("Don't know how to open this kind of object");
}
