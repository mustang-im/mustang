<PersonsAutocomplete persons={addresses} {placeholder}
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
  import type { PersonUID } from "../../../logic/Abstract/PersonUID";
  import PersonsAutocomplete from "../../Shared/PersonAutocomplete/PersonsAutocomplete.svelte";
  import PersonContextMenu from "./PersonContextMenu.svelte";
  import type { ArrayColl } from "svelte-collections";

  /** E.g. to, cc or bcc list
   * in/out */
  export let addresses: ArrayColl<PersonUID>;
  export let placeholder: string;

  function onAddPerson(person: PersonUID) {
    addresses.add(person);
  }
  function onRemovePerson(person: PersonUID) {
    addresses.remove(person);
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
