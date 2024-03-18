<PersonsAutocomplete {persons} {placeholder}>
  <hbox slot="result-bottom-row" class="recipient-email-address" let:person>
    {person.emailAddresses.first?.value}
  </hbox>
  <vbox slot="person-context-menu" class="context-menu" let:person>
    {person.name}
  </vbox>
  <slot name="end" slot="end" />
</PersonsAutocomplete>

<script lang="ts">
  import { PersonEmailAddress } from "../../../logic/Mail/EMail";
  import PersonsAutocomplete from "../../Shared/PersonAutocomplete/PersonsAutocomplete.svelte";
  import type { ArrayColl } from "svelte-collections";

  /** E.g. to, cc or bcc list
   * in/out */
  export let addresses: ArrayColl<PersonEmailAddress>;
  export let placeholder;

  // Map Person <- PersonEmailAddress
  $: persons = addresses.map(a => a.person);

  /*// Map Person -> PersonEmailAddress
  $: $persons && createPersonAddresses();
  function createPersonAddresses() {
    addresses.addAll(persons
      .contents.filter(person => !addresses.some(pe => pe.person == person))
      .map(person => PersonEmailAddress.fromPerson(person)));
  }*/
</script>

<style>
  .recipient-email-address {
    font-size: 10px;
    opacity: 50%;
    overflow: hidden;
    align-items: center;
  }
</style>
