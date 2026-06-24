<hbox class="new-event-button" style:background-color={$selectedCalendar.color}>
  <ButtonMenu bind:isMenuOpen>
    <RoundButton
      classes="add-button create"
      label={$t`New event`}
      icon={AddToCalendarIcon}
      iconSize="22px"
      padding="6px"
      slot="control"
      onClick={() => isMenuOpen = !isMenuOpen}
      />
    {#each appGlobal.calendars.each as calendar}
      <hbox class="menuitem" style="--calendar-color: {calendar.color}">
        <MenuItem
          icon={calendar.icon ?? CalendarIcon}
          label={calendar.name}
          onClick={() => addEvent(calendar)}
          />
      </hbox>
    {/each}
  </ButtonMenu>
  <AccountDropDown
    accounts={appGlobal.calendars}
    bind:selectedAccount={$selectedCalendar}
    withLabel={false}
    filterByWorkspace={true}
    icon={CalendarIcon}
    />
</hbox>

<script lang="ts">
  import { setNewEventTime } from "./event";
  import { openEvent } from "./open";
  import type { Calendar } from "../../logic/Calendar/Calendar";
  import { selectedCalendar, selectedDate } from "./selected";
  import { appGlobal } from "../../logic/app";
  import AccountDropDown from "../Shared/AccountDropDown.svelte";
  import ButtonMenu from "../Shared/Menu/ButtonMenu.svelte";
  import MenuItem from "../Shared/Menu/MenuItem.svelte";
  import RoundButton from "../Shared/RoundButton.svelte";
  import AddToCalendarIcon from "lucide-svelte/icons/plus";
  import CalendarIcon from "lucide-svelte/icons/calendar";
  import { t } from "../../l10n/l10n";

  let isMenuOpen = false;

  function addEvent(calendar: Calendar) {
    $selectedCalendar = calendar;
    let event = calendar.newEvent();
    setNewEventTime(event, false, $selectedDate);
    openEvent(event, true);
  }
</script>

<style>
  .new-event-button {
    align-items: center;
    border-right: 1px solid var(--border);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    border-radius: 30px;
    margin: 4px;
    padding-inline-end: 6px;
  }
  .new-event-button :global(.add-button) {
    align-items: center;
    justify-content: center;
    position: relative;
    margin-inline-end: 8px;
  }
  .menuitem :global(.menuitem .icon) {
    color: var(--calendar-color);
  }
  .new-event-button :global(.account-selector .icon) {
    color: white;
  }
  .new-event-button :global(.account-selector select) {
    color: white;
  }
</style>
