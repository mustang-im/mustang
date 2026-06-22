<hbox class="participant-status-text font-smallest">
  {#if $participant.response == InvitationResponse.Organizer }
    <span class="organizer">{$participant.responseLabel}</span>
  {:else if $participant.response == InvitationResponse.Accept }
    <span class="confirmed">{$participant.responseLabel}</span>
  {:else if $participant.response == InvitationResponse.Decline }
    <span class="declined">{$participant.responseLabel}</span>
  {:else if $participant.response == InvitationResponse.Tentative }
    <span class="tentative">{$participant.responseLabel}</span>
  {:else}
    <span class="unknown">{$t`No response yet`}</span>
  {/if}
</hbox>

<script lang="ts">
  import type { Participant } from "../../../logic/Calendar/Participant";
  import { InvitationResponse } from "../../../logic/Calendar/Invitation/InvitationStatus";
  import { t } from "../../../l10n/l10n";

  export let participant: Participant;
</script>

<style>
  .participant-status-text {
    padding: 8px 16px;
    border-left: 1px sold var(--border);
  }
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
  .unknown {
    color: rgb(113, 113, 52);
  }
</style>
