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
  {#if message.scheduling == Scheduling.REQUEST}
    <hbox>
      <Button label={$t`Accept`} onClick={onAccept} />
      <Button label={$t`Tentative`} onClick={onTentative} />
      <Button label={$t`Decline`} onClick={onDecline} />
    </hbox>
  {:else if message.scheduling}
    {@const calendars = message.getUpdateCalendars()}
    <hbox>
      <select value={calendar} disabled={calendars.length < 2}>
        {#each calendars as calendar}
          <option value={calendar}>calendar.name</option>
        {/each}
      </select>
      <Button label={$t`Update calendar`} disabled={!calendars.length && (message.scheduling == Scheduling.Cancellation ? t`This update has already been processed` : t`This event is not in your calendar`)} onClick={onUpdate} bind:this={update} />
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
  let calendar, update;

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
  async function onUpdate() {
    await calendar.updateFromResponse(message.scheduling, message.event);
    update.disabled = await t`This update has already been processed`;
  }
</script>

<style>
.invitation {
  background-color: var(--leftbar-bg);
  color: var(--leftbar-fg);
}
</style>
