<vbox class="invitation">
  {#if $message.event}
    <!-- TODO Properly fill the event object with all event data -->
    {#if $message.event.startTime}
      <DisplayEvent event={message.event} />
    {/if}
  {:else if message.scheduling}
    {#await loadEvent()}
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
      {#if selectedCalendar}
        <select value={selectedCalendar} disabled={calendars.length < 2}>
          {#each calendars as calendar}
            <option value={calendar}>{calendar.name}</option>
          {/each}
        </select>
      {/if}
      <Button label={$t`Accept`} onClick={onAccept} />
      <Button label={$t`Tentative`} onClick={onTentative} />
      <Button label={$t`Decline`} onClick={onDecline} />
    </hbox>
  {/if}
</vbox>

<script lang="ts">
  import type { EMail } from "../../logic/Mail/EMail";
  import { Calendar } from "../../logic/Calendar/Calendar";
  import { Scheduling, ResponseType, type Responses } from "../../logic/Calendar/Invitation";
  import DisplayEvent from "./DisplayEvent.svelte";
  import Button from "../Shared/Button.svelte";
  import { t } from "../../l10n/l10n";

  export let message: EMail;
  let calendars: Calendar[] = [];
  let selectedCalendar: Calendar | undefined;

  $: if (message.event) {
    loadCalendars();
  }

  async function loadEvent() {
    await message.loadEvent();
    loadCalendars();
  }
  function loadCalendars() {
    calendars = message.getUpdateCalendars();
    selectedCalendar = calendars[0];
  }

  async function respond(response: Responses) {
    await selectedCalendar.respondToInvitation(message, response);
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
