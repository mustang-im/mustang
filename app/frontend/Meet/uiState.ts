import { AppWindow } from "../MainWindow/AppWindow";
import { writable } from "svelte/store";

export function getMeetUIState(appWindow = AppWindow.current()) {
  return appWindow.uiState(createMeetUIState);
}

function createMeetUIState() {
  return {
    showDialPad: writable(false),
  };
}
