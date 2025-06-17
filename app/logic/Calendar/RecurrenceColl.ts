import { Event, RecurrenceCase } from "./Event";
import { ArrayColl, Collection, MapColl } from "svelte-collections";

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

type Ob = {
  unsubscribe: () => void,
  generatedRecurrences: Collection<Event>,
};

class RecurrenceCollectionObserver { // implements CollectionObserver
  resultColl: RecurrenceColl;
  masterObservers = new MapColl<Event, Ob>();

  constructor(resultColl: RecurrenceColl) {
    this.resultColl = resultColl;
  }

  added(events: Event[]) {
    for (let event of events) {
      if (event.recurrenceCase == RecurrenceCase.Master) {
        let ob = {} as Ob;
        function fill(event: Event) {
          ob.generatedRecurrences = event.fillRecurrences()
            .filterOnce(ev => !!ev); // Exceptions are null here
          this.resultColl.addAll(ob.generatedRecurrences);
        }
        fill(event);
        ob.unsubscribe = event.subscribe(() => {
          this.resultColl.removeAll(ob.generatedRecurrences);
          fill(event);
        });
        this.masterObservers.set(event, ob);
      } else {
        this.resultColl.add(event)
      }
    }
  }

  removed(events: Event[]) {
    for (let event of events) {
      if (event.recurrenceCase == RecurrenceCase.Master) {
        let ob = this.masterObservers.get(event);
        if (ob) {
          this.resultColl.removeAll(ob.generatedRecurrences);
          ob.unsubscribe();
        }
      } else {
        this.resultColl.remove(event)
      }
    }
  }
}
