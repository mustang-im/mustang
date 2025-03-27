<hbox class="buttons">
  {#if event.response == ResponseType.Unknown || event.response == ResponseType.Organizer}
    <Button label={$t`Accept`} onClick={onAccept} />
    <hbox class="spacer" />
    <Button label={$t`Reject`} onClick={onDecline} />
    <hbox class="spacer" />
    <Button label={$t`Maybe`} onClick={onTentative} />
  {/if}
</hbox>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import { ResponseType, type Responses } from "../../../logic/Calendar/Invitation";
  import Button from "../../Shared/Button.svelte";
  import { t } from "../../../l10n/l10n";

  export let event: Event;

  async function respond(response: Responses) {
    await event.respondToInvitation(response);
  }
  async function onAccept() {
    await respond(ResponseType.Accept);
  }
  async function onTentative() {
    await respond(ResponseType.Tentative);
  }
  async function onDecline() {
    await respond(ResponseType.Decline);
  }
</script>
