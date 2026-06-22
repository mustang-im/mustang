{#if calendars}
  <hbox class="calendar-selector">
    <AccountDropDown
      accounts={calendars}
      bind:selectedAccount={selectedCalendar}
      filterByWorkspace={false}
      disabled={calendars.length <= 1}
      icon={AccountIcon}
      />
    {#if selectedCalendar != currentCalendar}
      <Button
        label={$t`Move`}
        onClick={() => moveToCalendar(selectedCalendar)}
        />
    {/if}
  </hbox>
{/if}
<hbox class="buttons">
  {#if incomingInvitation}
    <InvitationButtons invitation={incomingInvitation} myParticipation={incomingInvitation.myParticipation} />
  {/if}
</hbox>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import type { Event } from "../../../logic/Calendar/Event";
  import type { Calendar } from "../../../logic/Calendar/Calendar";
  import type { IncomingInvitation } from "../../../logic/Calendar/Invitation/IncomingInvitation";
  import InvitationButtons from "./InvitationButtons.svelte";
  import AccountDropDown from "../../Shared/AccountDropDown.svelte";
  import Button from "../../Shared/Button.svelte";
  import AccountIcon from "lucide-svelte/icons/book-user";
  import { t } from "../../../l10n/l10n";
  import { assert } from "../../../logic/util/util";

  export let message: EMail;

  $: calendars = message.folder.account.calendarsAvailable;
  let selectedCalendar: Calendar | undefined; // undefined, because `null` means "All accounts" for `<AccountDropDown>`
  let incomingInvitation: IncomingInvitation;
  let eventInCalendar: Event | undefined;

  $: $message.event && initCalendar(message);
  function initCalendar(message: EMail) {
    for (let calendar of calendars) {
      if (calendar.hasMatchingEvent(message.event)) {
        selectCalendar(calendar);
        return;
      }
    }
    selectCalendar(message.folder.account.calendar);
  }
  let currentCalendar: Calendar;
  function selectCalendar(calendar: Calendar) {
    console.log("message", message, "default cal", message.folder.account.calendar, "available cals", message.folder.account.calendarsAvailable.contents.map(cal => cal.name))
    assert(calendar, "Need calendar");
    selectedCalendar = calendar;
    currentCalendar = calendar;
    incomingInvitation = selectedCalendar.getIncomingInvitationForEMail(message);
    eventInCalendar = incomingInvitation.calEvent();
    console.log("select calendar", calendar.name, "incoming invitation", incomingInvitation)
  }
  async function moveToCalendar(calendar: Calendar) {
    if (eventInCalendar && !selectedCalendar.events.some(event => event.calUID == message.event.calUID)) {
      await eventInCalendar.moveToCalendar(selectedCalendar);
    }
    selectCalendar(calendar);
  }
</script>

<style>
  .buttons {
    align-items: center;
    justify-content: center;
    margin-block-start: 16px;
  }
  .calendar-selector {
    margin-inline-start: 12px;
  }
  .calendar-selector :global(select) {
    margin-inline-start: 8px;
  }
</style>
