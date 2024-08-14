import { Observable, notifyChangedProperty } from "../util/Observable";
import { SetColl } from "svelte-collections";
import { sanitize } from "../../../lib/util/sanitizeDatatypes";

/**
 * Defines a tag/keyword that can be set on an email.
 *
 * This describes the generic class of a tag.
 * The instance of a tag is represented by `EMail.tags`.
 */
export class Tag extends Observable {
  /** ID of the tag. Usually identical to what is displayed to the user.
   * Must be unique. */
  @notifyChangedProperty
  name: string;
  /** HTML color code for the background color of this tag */
  @notifyChangedProperty
  color: string;
}

export const availableTags = new SetColl<Tag>();

export async function loadTagsList() {
  let json: any[] = sanitize.array(JSON.parse(sanitize.string(localStorage.getItem("tags"), "")), []);
  availableTags.clear();
  for (let tagJSON of json) {
    let tag = new Tag();
    tag.name = sanitize.label(tagJSON.name);
    tag.color = sanitize.string(tagJSON.color, "#00FF00");
    availableTags.add(tag);
  }
}

export async function saveTagsList() {
  let json = availableTags.contents.map(tag => ({
    name: tag.name,
    color: tag.color,
  }));
  localStorage.setItem("tags", JSON.stringify(json));
}