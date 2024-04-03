<PersonsAutocomplete {persons} {placeholder}
  on:personSelected={(event) => onAddPerson(event.detail)}>
  <hbox slot="result-bottom-row" class="recipient-email-address" let:person>
    {person.emailAddresses.first?.value}
  </hbox>
  <vbox slot="person-context-menu" class="context-menu" let:person>
    <PersonContextMenu {person}
      on:remove={(event) => onRemovePerson(event.detail)} />
  </vbox>
  <slot name="end" slot="end" />
</PersonsAutocomplete>

<script lang="ts">
  import { PersonEmailAddress } from "../../../logic/Mail/EMail";
  import type { Person } from "../../../logic/Abstract/Person";
  import PersonsAutocomplete from "../../Shared/PersonAutocomplete/PersonsAutocomplete.svelte";
  import PersonContextMenu from "./PersonContextMenu.svelte";
  import type { ArrayColl } from "svelte-collections";

  /** E.g. to, cc or bcc list
   * in/out */
  export let addresses: ArrayColl<PersonEmailAddress>;
  export let placeholder: string;

  // Map Person <- PersonEmailAddress
  $: persons = $addresses.map(a => a.person);

  // Map newly added PersonEmailAddress -> Person
  function onAddPerson(person: Person) {
    addresses.add(PersonEmailAddress.fromPerson(person));
  }
  function onRemovePerson(person: Person) {
    addresses.remove(addresses.find(a => a.person == person));
  }
</script>

<style>
  .recipient-email-address {
    font-size: 10px;
    opacity: 50%;
    overflow: hidden;
    align-items: center;
  }
</style>
