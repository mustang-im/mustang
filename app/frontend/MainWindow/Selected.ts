import type { Workspace } from "../../logic/Abstract/Workspace";
import { writable } from "svelte/store";

export const selectedWorkspace = writable<Workspace>();
