<PersonsAutocomplete {persons} {placeholder}>
  <hbox slot="display-bottom-row" class="recipient-email-address" let:person>
    {person.emailAddresses.first?.value}
  </hbox>
  <hbox slot="result-bottom-row" class="recipient-email-address" let:person>
    {person.emailAddresses.first?.value}
  </hbox>
</PersonsAutocomplete>

<script lang="ts">
  import type { Person } from "../../../logic/Abstract/Person";
  import PersonsAutocomplete from "../../Shared/PersonAutocomplete/PersonsAutocomplete.svelte";
  import type { MapColl } from "svelte-collections";

  /** E.g. to, cc or bcc list
   * in/out */
  export let persons: MapColl<string, Person>;
  export let placeholder = "Add recipients";
</script>

<style>
  .recipient-email-address {
    font-size: 10px;
    margin-top: -1px;
    opacity: 50%;
    overflow: hidden;
  }
</style>
