import { NodeEx, EdgeEx, ListNodeEx } from "../Vis";
import { Event, RecurrenceCase } from "../../../logic/Calendar/Event";
import { getDateString, getTimeString } from "../../Util/date";
import { gt } from "../../../l10n/l10n";
import { ArrayColl, type Collection } from "svelte-collections";
import { visPersonUID } from "./VisPerson";

/** Node for a single meeting */
export class VisEvent extends NodeEx {
  event: Event;

  constructor(event: Event, fromNode?: NodeEx) {
    let future = event.startTime > new Date();
    // single meetings: yellow, recurring: orange
    // future: strong color, past: semi-transparent
    let color = event.recurrenceCase == RecurrenceCase.Normal
      ? (future ? "#fffb00ff" : "#fffb00bc")
      : (future ? "#ffd256ff" : "#ffbb0092");
    super({
      label: event.title.substring(0, 30) + "\n" +
        getDateString(event.startTime) + "\n" +
        getTimeString(event.startTime),
      shape: "diamond",
      color: color,
    }, fromNode);
    this.event = event;
  }

  protected persons(): Collection<NodeEx> {
    let nodes = new ArrayColl<NodeEx>();
    for (let participant of this.event.participants) {
      nodes.add(visPersonUID(participant, this));
    }
    return nodes;
  }

  async expand(): Promise<Collection<NodeEx>> {
    await super.expand();
    return this.persons();
  }

  async openSide(): Promise<void> {
  };
}

/** Node for a list of meetings */
export class VisEventsList extends ListNodeEx {
  events: Collection<Event>;

  constructor(label: string | null, fromNode?: NodeEx) {
    super({
      label: label ?? gt`Meetings`,
      shape: "box",
      color: "#fffb00ff",
    }, fromNode);
  }

  async openSide(): Promise<void> {
  };
}
