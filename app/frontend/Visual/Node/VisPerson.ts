import { NodeEx, EdgeEx, ListNodeEx } from "../Vis";
import type { Person } from "../../../logic/Abstract/Person";
import type { PersonUID } from "../../../logic/Abstract/PersonUID";
import { RecurrenceCase } from "../../../logic/Calendar/Event";
import { newSearchEMail } from "../../../logic/Mail/Store/setStorage";
import { VisEMailSearch } from "./VisEMail";
import { VisEvent, VisEventsList } from "./VisEvent";
import { appGlobal } from "../../../logic/app";
import { showError } from "../../Util/error";
import { gt } from "../../../l10n/l10n";
import { ArrayColl, Collection, MapColl, SetColl } from "svelte-collections";

/** Node for a single person.
 * it can expand to show related persons, email lists etc. */
export class VisPerson extends NodeEx {
  person: Person;

  constructor(person: Person, fromNode?: NodeEx) {
    let name = person.firstName
      ? person.firstName + (person.lastName ? "\n" + person.lastName : "")
      : person.name?.substring(0, 12) ?? "?";
    if (name.includes("@")) {
      name = name.split("@")[0].substring(0, 10);
    }
    super({
      label: name,
      shape: "circle",
      color: "red",
    });
    this.person = person;
    if (fromNode) {
      this.edges.add(new EdgeEx(fromNode, this));
    }
  }

  async expand(): Promise<Collection<NodeEx>> {
    console.log("expand person", this.person.name);
    let nodes = new ArrayColl<NodeEx>();

    let emailsSearch = newSearchEMail();
    emailsSearch.includesPerson = this.person;
    nodes.add(new VisEMailSearch(emailsSearch, this));

    nodes.addAll(this.eventNodes());

    (async () => {
      nodes.addAll(await this.relatedPersonsNodes());
    })().catch(showError);
    return nodes;
  }

  protected eventNodes(): Collection<NodeEx> {
    let nodes = new ArrayColl<NodeEx>();
    let events = appGlobal.calendarEvents.filterOnce(ev => ev.participants.some(p => p.matchesPerson(this.person)));
    let now = new Date();
    let nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    let pastEvents = events.filterOnce(ev => ev.startTime < now && ev.recurrenceCase == RecurrenceCase.Normal);
    let futureEvents = events.filterOnce(ev => ev.startTime > now && (ev.recurrenceCase == RecurrenceCase.Normal || ev.startTime < nextWeek));
    if (pastEvents.hasItems) {
      let pastNode = new VisEventsList(gt`Previous meetings`, this);
      nodes.add(pastNode);
      pastNode.events = pastEvents;
      for (let event of pastEvents) {
        nodes.add(new VisEvent(event, pastNode));
      }
    }
    if (futureEvents.hasItems) {
      let futureNode = new VisEventsList(gt`Upcoming meetings`, this);
      nodes.add(futureNode);
      futureNode.events = futureEvents;
      for (let event of futureEvents) {
        nodes.add(new VisEvent(event, futureNode));
      }
    }
    return nodes;
  }

  protected async relatedPersonsNodes(): Promise<Collection<NodeEx>> {
    let nodes = new ArrayColl<NodeEx>();
    let search = newSearchEMail();
    search.includesPerson = this.person;
    let emails = await search.startSearch();

    let listNode = new VisPersonsList(gt`Persons in same email`, this);
    nodes.add(listNode);
    listNode.persons = new SetColl<Person>();

    for (let email of emails) {
      let involved = new SetColl<PersonUID>();
      involved.add(email.from);
      involved.addAll(email.to);
      involved.addAll(email.cc);
      involved.removeAll(involved.filterOnce(p =>
        p.emailAddress?.includes("@invalid") ||
        p.matchesPerson(this.person)));

      // Create persons and connect them to this person
      for (let personUID of involved) {
        let person = personUID.createPerson();
        listNode.persons.add(person);
        nodes.add(visPerson(person, listNode));
      }
      /* // Connect these persons among themselves
      let fromNode = visPersonUID(email.from);
      for (let toUID of involved) {
        let toNode = visPersons.get(toUID.findPerson());
        fromNode?.edgeTo(toNode);
      }*/
    }
    return nodes;
  }

  async openSide(): Promise<void> {
  };
}

export class VisPersonUID extends VisPerson {
  constructor(personUID: PersonUID, fromNode: NodeEx) {
    super(personUID.createPerson(), fromNode);
  }
}

/** Node for a list of persons */
export class VisPersonsList extends ListNodeEx {
  persons: Collection<Person>;

  constructor(label: string | null, fromNode?: NodeEx) {
    super({
      label: label ?? gt`Related rersons`,
      shape: "box",
      color: "red",
    });
    if (fromNode) {
      this.edges.add(new EdgeEx(fromNode, this));
    }
  }

  async openSide(): Promise<void> {
  };
}

export function visPerson(person: Person, fromNode?: NodeEx): VisPerson {
  let existing = visPersons.get(person);
  if (existing) {
    fromNode?.edgeTo(existing);
    return existing;
  }
  let vis = new VisPerson(person, fromNode);
  visPersons.set(person, vis);
  fromNode?.edgeTo(vis);
  return vis;
}

export function visPersonUID(personUID: PersonUID, fromNode?: NodeEx): VisPerson {
  return visPerson(personUID.createPerson(), fromNode);
}

const visPersons = new MapColl<Person, VisPerson>();
