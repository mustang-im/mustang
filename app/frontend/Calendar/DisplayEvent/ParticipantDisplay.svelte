<hbox class="participant-name"
  on:click={() => catchErrors(() => onOpenParticipant(participant))}>
  {participant.name}
</hbox>

<script lang="ts">
  import { Participant } from "../../../logic/Calendar/Participant";
  import { openPersonFromOtherApp } from "../../Contacts/open";
  import { catchErrors } from "../../Util/error";

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
