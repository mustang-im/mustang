<Clickable onClick={() => onOpenParticipant(participant)}>
  <hbox class="participant" title={participant.name + ($participant.responseLabel ? ": " : "") + $participant.responseLabel}>
    <ParticipantConfirmIcon {participant} />
    <hbox class="participant-name">
      {participant.name}
    </hbox>
  </hbox>
</Clickable>

<script lang="ts">
  import { Participant } from "../../../logic/Calendar/Participant";
  import { openPersonFromOtherApp } from "../../Contacts/open";
  import ParticipantConfirmIcon from "../EditEvent/ParticipantConfirmIcon.svelte";
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
  .participant {
    align-items: center;
  }
  .participant-name {
    cursor: pointer;
    margin-inline-start: 4px;
  }
  .participant-name:hover {
    color: var(--link-hover-fg);
  }
</style>
