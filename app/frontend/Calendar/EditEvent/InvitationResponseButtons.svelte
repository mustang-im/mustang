<hbox class="buttons">
  {#if event.response == ResponseType.Unknown || event.response == ResponseType.Organizer}
    <Button label={$t`Accept`} onClick={onAccept} />
    <hbox class="spacer" />
    <Button label={$t`Decline`} onClick={onDecline} />
    <hbox class="spacer" />
    <Button label={$t`Tentative`} onClick={onTentative} />
  {/if}
</hbox>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import { ResponseType, type Responses } from "../../../logic/Calendar/Invitation";
  import Button from "../../Shared/Button.svelte";
  import { backgroundError } from "../../Util/error";
  import { t } from "../../../l10n/l10n";

  export let event: Event;

  function respond(response: Responses) {
    event.respondToInvitation(response).catch(backgroundError);
  }
  function onAccept() {
    respond(ResponseType.Accept);
  }
  function onTentative() {
    respond(ResponseType.Tentative);
  }
  function onDecline() {
    respond(ResponseType.Decline);
  }
</script>

<style>
</style>
