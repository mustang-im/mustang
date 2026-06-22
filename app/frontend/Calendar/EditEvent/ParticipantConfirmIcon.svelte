<hbox class="participant-status-icon font-smallest"
  class:confirmed={$participant.response == InvitationResponse.Accept}
  class:declined={$participant.response == InvitationResponse.Decline}
  class:tentative={$participant.response == InvitationResponse.Tentative}
  class:organizer={$participant.response == InvitationResponse.Organizer}
  class:unknown={$participant.response == InvitationResponse.Unknown}
  title={$participant.responseLabel}
  >
  {#if $participant.response == InvitationResponse.Organizer}
    <OrganizerIcon {size} />
  {:else if $participant.response == InvitationResponse.Accept}
    <AcceptedIcon {size} />
  {:else if $participant.response == InvitationResponse.Decline}
    <DeclinedIcon {size} />
  {:else if $participant.response == InvitationResponse.Tentative}
    <TentativeIcon {size} />
  {:else}
    <!--<UnknownIcon {size} title={$t`No response yet`} />-->
  {/if}
</hbox>

<script lang="ts">
  import type { Participant } from "../../../logic/Calendar/Participant";
  import { InvitationResponse } from "../../../logic/Calendar/Invitation/InvitationStatus";
  import AcceptedIcon from "lucide-svelte/icons/check-check";
  import DeclinedIcon from "lucide-svelte/icons/x";
  import TentativeIcon from "lucide-svelte/icons/circle-question-mark";
  import OrganizerIcon from "lucide-svelte/icons/contact-round";

  export let participant: Participant;
  export let size = 16;
</script>

<style>
  .organizer {
    color: green;
  }
  .confirmed {
    color: green;
  }
  .declined {
    color: red;
  }
  .tentative {
    color: darkorange;
  }
</style>
