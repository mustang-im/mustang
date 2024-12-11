// SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>
//
// SPDX-License-Identifier: EUPL-1.2

import type { Person } from "../Abstract/Person";
import type { PersonUID } from "../Abstract/PersonUID";
import type { EMail } from "./EMail";
import { ArrayColl, Collection, MapColl } from "svelte-collections";

export function personsInEMails(messages: Collection<EMail>): Collection<Person> {
  let persons = new MapColl<Person, number>(); /** Person -> count */
  function addUID(uid: PersonUID) {
    let person = uid?.person
    if (!person) {
      return;
    }
    let count = persons.get(person);
    persons.set(person, count ? count++ : 1);
  }
  function addUIDs(uids: Collection<PersonUID>) {
    for (let uid of uids) {
      addUID(uid);
    }
  }
  for (let msg of messages) {
    addUID(msg.from);
    addUIDs(msg.to);
    addUIDs(msg.cc);
    addUIDs(msg.bcc);
  }

  // sort
  return new ArrayColl([...persons.entries()].sort((a, b) => a[1] - b[1]).map(a => a[0]));
}
