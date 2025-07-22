<hbox class="participant-name"
  on:click={() => catchErrors(() => onOpenParticipant(participant))}>
  {participant.name}
</hbox>

<script lang="ts">
  import { Participant } from "../../../logic/Calendar/Participant";
  import { openUIFor } from "../../AppsBar/changeTo";
  import { catchErrors } from "../../Util/error";

  export let participant: Participant;

  function onOpenParticipant(participant: Participant) {
    let person = participant.findPerson();
    if (!person) {
      return;
    }
    openUIFor(person);
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
