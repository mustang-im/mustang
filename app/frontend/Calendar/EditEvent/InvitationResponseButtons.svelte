<hbox class="buttons">
  {#if event.myParticipation == InvitationResponse.Unknown || event.myParticipation == InvitationResponse.Organizer}
    <Button label={$t`Accept`} onClick={onAccept} />
    <hbox class="spacer" />
    <Button label={$t`Reject`} onClick={onDecline} />
    <hbox class="spacer" />
    <Button label={$t`Maybe`} onClick={onTentative} />
  {/if}
</hbox>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import { InvitationResponse, type InvitationResponseInMessage } from "../../../logic/Calendar/Invitation/InvitationStatus";
  import Button from "../../Shared/Button.svelte";
  import { t } from "../../../l10n/l10n";

  export let event: Event;

  async function respond(response: InvitationResponseInMessage) {
    await event.respondToInvitation(response);
  }
  async function onAccept() {
    await respond(InvitationResponse.Accept);
  }
  async function onTentative() {
    await respond(InvitationResponse.Tentative);
  }
  async function onDecline() {
    await respond(InvitationResponse.Decline);
  }
</script>
