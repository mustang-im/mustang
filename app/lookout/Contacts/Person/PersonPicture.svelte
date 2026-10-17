<PersonCircle name={$contact?.name} picture={$contact?.picture} colorKey={preferredEmail}
  isGroup={contact instanceof Group} {size} />

<script lang="ts">
  import type { PersonOrGroup } from "../../../frontend/Contacts/Person/PersonOrGroup";
  import { Person, type ContactEntry } from "../../../logic/Abstract/Person";
  import { Group } from "../../../logic/Abstract/Group";
  import { PreferredEntry } from "../PreferredEntry";
  import PersonCircle from "./PersonCircle.svelte";
  import { ArrayColl } from "svelte-collections";

  export let contact: PersonOrGroup;
  export let size = 40;

  $: emailAddresses = contact instanceof Person ? contact.emailAddresses : new ArrayColl<ContactEntry>();
  $: preferredEmail = PreferredEntry.valueOf($emailAddresses);
</script>
