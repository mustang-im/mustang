<PersonsAutocomplete persons={addresses} {placeholder} {tabindex} {autofocus}
  on:addPerson={(event) => onAddPerson(event.detail)}
  on:removePerson={(event) => onRemovePerson(event.detail)}
  >
  <hbox slot="result-bottom-row" class="recipient-email-address font-small" let:person>
    {person.emailAddress}
  </hbox>
  <slot name="end" slot="end" />
  <hbox class="addressbooks" slot="person-popup-bottom" let:person class:top-border={person?.person?.emailAddresses.length > 1}>
    {#if person?.person}
      <AddressbookChanger person={person.person} />
    {/if}
  </hbox>
 <slot name="person-popup-buttons" slot="person-popup-buttons" let:person {person} />
</PersonsAutocomplete>

<script lang="ts">
  import type { PersonUID } from "../../../logic/Abstract/PersonUID";
  import PersonsAutocomplete from "../../Contacts/PersonAutocomplete/PersonsAutocomplete.svelte";
  import AddressbookChanger from "../../Contacts/AddressbookChanger.svelte";
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

  .addressbooks {
    padding: 12px;
    max-width: 280px;
  }
  .addressbooks.top-border {
    border-top: 1px solid var(--border);
  }
  .addressbooks:not(.top-border) {
    margin-block-start: -6px;
    padding-block-start: 0px;
  }
</style>
