<Clickable onClick={() => onOpenParticipant(participant)}>
  <hbox class="participant-name">
    {participant.name}
  </hbox>
</Clickable>

<script lang="ts">
  import { Participant } from "../../../logic/Calendar/Participant";
  import { openPersonFromOtherApp } from "../../Contacts/open";
  import Clickable from "../../Shared/Clickable.svelte";

  export let participant: Participant;

  function onOpenParticipant(participant: Participant) {
    let person = participant.findPerson();
    if (!person) {
      return;
    }
    openPersonFromOtherApp(person);
  }
</script>

<style>
  .participant-name {
    cursor: pointer;
  }
  .participant-name:hover {
    color: var(--link-hover-fg);
  }
</style>
