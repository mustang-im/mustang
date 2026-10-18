import type { Topic } from "../../logic/Topic/Topic";
import type { TopicAccount } from "../../logic/Topic/TopicAccount";
import { AppWindow } from "../MainWindow/AppWindow";
import { writable, type Writable } from "svelte/store";

export function getTopicSelection(appWindow = AppWindow.current()) {
  return appWindow.uiState(createTopicSelection);
}

function createTopicSelection() {
  return {
    selectedAccount: writable(null) as Writable<TopicAccount>,
    selectedTopic: writable(null) as Writable<Topic>,
  };
}
