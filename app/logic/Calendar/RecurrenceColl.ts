import { Event, RecurrenceCase } from "./Event";
import { ArrayColl, Collection } from "svelte-collections";

export class RecurrenceColl extends ArrayColl<Event> {
  protected source: Collection<Event>;

  constructor(source: Collection<Event>) {
    super();
    this.source = source;

    let observer = new RecurrenceCollectionObserver(this);
    source.registerObserver(observer);
    observer.added(source.contents);
  }
}

class RecurrenceCollectionObserver { // implements CollectionObserver
  resultColl: RecurrenceColl;

  constructor(resultColl: RecurrenceColl) {
    this.resultColl = resultColl;
  }

  added(events: Event[]) {
    for (let event of events) {
      if (event.recurrenceCase == RecurrenceCase.Master) {
        let recurrences = event.fillRecurrences()
          .filterOnce(ev => !!ev); // Exceptions are null here
        this.resultColl.addAll(recurrences);
      } else {
        this.resultColl.add(event)
      }
    }
  }

  removed(events: Event[]) {
    for (let event of events) {
      if (event.recurrenceCase == RecurrenceCase.Master) {
        let recurrences = event.fillRecurrences();
        this.resultColl.removeAll(recurrences);
      } else {
        this.resultColl.remove(event)
      }
    }
  }
}
