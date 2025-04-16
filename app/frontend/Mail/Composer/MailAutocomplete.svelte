<PersonsAutocomplete persons={addresses} {placeholder} {tabindex} {autofocus}
  on:addPerson={(event) => onAddPerson(event.detail)}
  on:removePerson={(event) => onRemovePerson(event.detail)}
  >
  <hbox slot="result-bottom-row" class="recipient-email-address font-small" let:person>
    {person.emailAddress}
  </hbox>
  <slot name="end" slot="end" />
  <slot name="person-popup-buttons" slot="person-popup-buttons" let:person {person} />
</PersonsAutocomplete>

<script lang="ts">
  import type { PersonUID } from "../../../logic/Abstract/PersonUID";
  import PersonsAutocomplete from "../../Contacts/PersonAutocomplete/PersonsAutocomplete.svelte";
  import type { ArrayColl } from "svelte-collections";

  /** E.g. to, cc or bcc list
   * in/out */
  export let addresses: ArrayColl<PersonUID>;
  export let placeholder: string;
  export let tabindex = null;
  export let autofocus = false;

  function onAddPerson(person: PersonUID) {
    addresses.add(person);
  }
  function onRemovePerson(person: PersonUID) {
    addresses.remove(person);
  }
</script>

<style>
  .recipient-email-address {
    opacity: 50%;
    overflow: hidden;
    align-items: center;
  }
</style>
