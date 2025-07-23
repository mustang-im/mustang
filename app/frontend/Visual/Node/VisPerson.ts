import { NodeEx, ListNodeEx, type SvelteComponentInstance } from "../VisNode";
import type { Person } from "../../../logic/Abstract/Person";
import type { PersonUID } from "../../../logic/Abstract/PersonUID";
import { RecurrenceCase } from "../../../logic/Calendar/Event";
import { newSearchEMail } from "../../../logic/Mail/Store/setStorage";
import { VisEMailSearch } from "./VisEMail";
import { VisEvent, VisEventsList } from "./VisEvent";
import { appGlobal } from "../../../logic/app";
import PersonDetails from "../../Contacts/PersonDetails.svelte";
import { showError } from "../../Util/error";
import { gt } from "../../../l10n/l10n";
import { ArrayColl, Collection, MapColl, SetColl } from "svelte-collections";
import PersonsList from "../../Contacts/Person/PersonsList.svelte";

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
    }, fromNode);
    this.person = person;
  }

  async expand(): Promise<Collection<NodeEx>> {
    console.log("expand person", this.person.name);
    let nodes = await super.expand();

    let emailsSearch = newSearchEMail();
    emailsSearch.includesPerson = this.person;
    nodes.add(new VisEMailSearch(emailsSearch, this));

    nodes.addAll(this.events());

    (async () => {
      nodes.addAll(await this.relatedPersons());
    })().catch(showError);
    return nodes;
  }

  protected events(): Collection<NodeEx> {
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
        let visEvent = new VisEvent(event, pastNode);
        nodes.add(visEvent);
        //nodes.addAll(visEvent.persons());
      }
    }
    if (futureEvents.hasItems) {
      let futureNode = new VisEventsList(gt`Upcoming meetings`, this);
      nodes.add(futureNode);
      futureNode.events = futureEvents;
      for (let event of futureEvents) {
        let visEvent = new VisEvent(event, futureNode);
        nodes.add(visEvent);
        // nodes.addAll(visEvent.expand());
      }
    }
    return nodes;
  }

  protected async relatedPersons(): Promise<Collection<NodeEx>> {
    let nodes = new ArrayColl<NodeEx>();
    let search = newSearchEMail();
    search.includesPerson = this.person;
    let emails = await search.startSearch(100);

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
        nodes.add(visPersonUID(toUID, fromNode));
      }*/
    }
    return nodes;
  }

  openSide(): SvelteComponentInstance | null {
    return {
      component: PersonDetails,
      properties: {
        person: this.person,
        horizontal: true,
      },
    };
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
    }, fromNode);
  }

  openSide(): SvelteComponentInstance | null {
    return {
      component: PersonsList,
      properties: {
        persons: this.persons,
        size: "small",
      },
    };
  };
}

export function visPerson(person: Person, fromNode?: NodeEx): VisPerson {
  let existing = visPersons.get(person);
  if (existing) {
    // fromNode?.edgeTo(existing); // TODO Creates double-connections between the same 2 nodes, despite NodeEx.edgeTo() checking for that
    return existing;
  }
  let vis = new VisPerson(person, fromNode);
  visPersons.set(person, vis);
  return vis;
}

export function visPersonUID(personUID: PersonUID, fromNode?: NodeEx): VisPerson {
  return visPerson(personUID.createPerson(), fromNode);
}

export const visPersons = new MapColl<Person, VisPerson>();
