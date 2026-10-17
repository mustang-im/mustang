import { backstagePage, isBackstageOpen, type BackstagePage } from "./selected";
import { derived } from "svelte/store";

export const backstageState = {
  subscribe: derived([isBackstageOpen, backstagePage], ([isOpen, page]) => ({ isOpen, page })).subscribe,
  open(page: BackstagePage = "info") {
    backstagePage.set(page);
    isBackstageOpen.set(true);
  },
  close() {
    isBackstageOpen.set(false);
  },
};
