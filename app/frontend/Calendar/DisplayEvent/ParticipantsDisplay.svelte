<PersonsCommaList persons={participants}>
  <ParticipantDisplay participant={person} let:person slot="person" />
</PersonsCommaList>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import PersonsCommaList from "../../Contacts/Person/PersonsCommaList.svelte";
  import ParticipantDisplay from "./ParticipantDisplay.svelte";

  export let event: Event;

  $: participants = event.participants;
</script>
