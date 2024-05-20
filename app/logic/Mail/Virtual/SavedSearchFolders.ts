import { Folder } from "../Folder";
import { assert } from "../../util/util";
import { ArrayColl } from "svelte-collections";

export const savedSearchFolders = new ArrayColl<Folder>();

/** Called on startup only */
function readSaveSearches() {
  assert(savedSearchFolders.isEmpty, "Already read saved searches. Call this only once at startup");
  let allJSON = JSON.parse(localStorage.getItem("savedSearches") ?? "[]");
  assert(Array.isArray(allJSON), "Could not read saved searches");
  for (let savedSearchJSON of allJSON) {

  }
}

function saveSavedSearches() {
}
