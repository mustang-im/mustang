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
  import type { Person } from "../../../logic/Abstract/Person";
  import PersonsAutocomplete from "../../Shared/PersonAutocomplete/PersonsAutocomplete.svelte";
  import type { MapColl } from "svelte-collections";

  /** E.g. to, cc or bcc list
   * in/out */
  export let persons: MapColl<string, Person>;
  export let placeholder;
</script>

<style>
  .recipient-email-address {
    font-size: 10px;
    opacity: 50%;
    overflow: hidden;
    align-items: center;
  }
</style>
