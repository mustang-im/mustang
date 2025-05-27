import type { Directory } from "./Directory";
import type { Tag, TaggableObject } from "../Abstract/Tag";
import { Observable, notifyChangedProperty } from "../util/Observable";
import { AbstractFunction, assert } from "../util/util";
import { SetColl } from "svelte-collections";

export class FileOrDirectory extends Observable implements TaggableObject {
  /** Full file path and name */
  path: string;
  /** Full path to the local file on user's disk. May be null */
  filepathLocal: string | null = null;
  /** Excluding directory path. For files, including file ext. */
  @notifyChangedProperty
  name: string;
  parent: Directory;
  lastMod = new Date();
  readonly tags = new SetColl<Tag>();

  get id() {
    return this.path;
  }
  set id(id: string) {
    this.path = id;
  }

  canDelete: boolean;
  async deleteIt() {
    throw new AbstractFunction();
  }

  async addTag(tag: Tag) {
  }

  async removeTag(tag: Tag) {
  }
}
