import { MustangApp } from "../AppsBar/MustangApp";
import TopicIcon from "lucide-svelte/icons/share-2";
import { gt } from "../../l10n/l10n";

export class TopicMustangApp extends MustangApp {
  id = "topic";
  name = gt`Topic`;
  icon = TopicIcon;
  appURL = "/topic";
}

export const topicMustangApp = new TopicMustangApp();
