import { NodeEx, EdgeEx } from "../Vis";
import { Event, RecurrenceCase } from "../../../logic/Calendar/Event";
import { getDateString, getTimeString } from "../../Util/date";

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
    });
    this.event = event;
    if (fromNode) {
      this.edges.add(new EdgeEx(fromNode, this));
    }
  }

  async openSide(): Promise<void> {
  };
}
