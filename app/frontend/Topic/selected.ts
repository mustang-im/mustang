import type { Topic } from "../../logic/Topic/Topic";
import type { TopicAccount } from "../../logic/Topic/TopicAccount";
import { writable, type Writable } from "svelte/store";

export let selectedAccount: Writable<TopicAccount> = writable(null);
export let selectedTopic: Writable<Topic> = writable(null);
