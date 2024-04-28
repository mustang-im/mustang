import type { IObservable } from "../../../logic/util/Observable";

export interface PersonOrGroup extends IObservable {
  id: string;
  name: string;
  picture: string; /** URL */
}
