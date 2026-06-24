<hbox class="new-event-button">
  <RoundButton
    classes="add-button create"
    label={$t`New event`}
    icon={AddToCalendarIcon}
    onClick={addEvent}
    iconSize="22px"
    padding="6px"
    />
  <AccountDropDown
    accounts={appGlobal.calendars}
    selectedAccount={$selectedCalendar}
    withLabel={false}
    filterByWorkspace={true}
    icon={CalendarIcon}
    />
</hbox>

<script lang="ts">
  import { setNewEventTime } from "./event";
  import { openEvent } from "./open";
  import { selectedCalendar, selectedDate } from "./selected";
  import { appGlobal } from "../../logic/app";
  import AccountDropDown from "../Shared/AccountDropDown.svelte";
  import RoundButton from "../Shared/RoundButton.svelte";
  import AddToCalendarIcon from "lucide-svelte/icons/plus";
  import CalendarIcon from "lucide-svelte/icons/calendar";
  import { assert } from "../../logic/util/util";
  import { t } from "../../l10n/l10n";

  function addEvent() {
    $selectedCalendar ??= appGlobal.calendars.first;
    assert($selectedCalendar, $t`Please set up a calendar first`);
    let event = $selectedCalendar.newEvent();
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
</style>
