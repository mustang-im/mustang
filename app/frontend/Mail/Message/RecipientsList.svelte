<PersonsCommaList persons={recipients}>
  <Recipient recipient={person} let:person slot="person" />
</PersonsCommaList>

<script lang="ts">
  import { type PersonUID } from "../../../logic/Abstract/PersonUID";
  import PersonsCommaList from "../../Contacts/Person/PersonsCommaList.svelte";
  import Recipient from "./Recipient.svelte";
  import type { Collection } from "svelte-collections";

  export let recipients: Collection<PersonUID>;
</script>
