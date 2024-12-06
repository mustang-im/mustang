<vbox class="invitation">
  {#if $message.event}
    <DisplayEvent event={message.event} />
  {:else if message.scheduling}
    {#await message.loadEvent()}
      Loading event...
    {:then}
      Event loaded
    {:catch ex}
      {ex?.message}
      {ex}
    {/await}
  {/if}
  {#if message.scheduling == Scheduling.Request}
    <hbox>
      <Button label={$t`Accept`} onClick={onAccept} />
      <Button label={$t`Tentative`} onClick={onTentative} />
      <Button label={$t`Decline`} onClick={onDecline} />
    </hbox>
  {/if}
</vbox>

<script lang="ts">
  import type { EMail } from "../../logic/Mail/EMail";
  import { Scheduling, ResponseType, type Responses } from "../../logic/Calendar/IMIP";
  import DisplayEvent from "./DisplayEvent.svelte";
  import Button from "../Shared/Button.svelte";
  import { t } from "../../l10n/l10n";

  export let message: EMail;

  async function respond(response: Responses) {
    await message.respondToInvitation(response);
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

<style>
.invitation {
  background-color: var(--leftbar-bg);
  color: var(--leftbar-fg);
}
</style>
