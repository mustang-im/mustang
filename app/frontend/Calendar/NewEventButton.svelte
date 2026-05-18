<hbox class="new-event-button">
  <RoundButton
    classes="add-button create"
    label={$t`New event`}
    icon={AddToCalendarIcon}
    onClick={addEvent}
    iconSize="22px"
    padding="6px"
    />
</hbox>

<script lang="ts">
  import { setNewEventTime } from "./event";
  import { openEventFromOtherApp } from "./open";
  import { selectedCalendar, selectedDate } from "./selected";
  import { appGlobal } from "../../logic/app";
  import RoundButton from "../Shared/RoundButton.svelte";
  import AddToCalendarIcon from "lucide-svelte/icons/plus";
  import { assert } from "../../logic/util/util";
  import { t } from "../../l10n/l10n";

  function addEvent() {
    $selectedCalendar ??= appGlobal.calendars.first;
    assert($selectedCalendar, $t`Please set up a calendar first`);
    let event = $selectedCalendar.newEvent();
    setNewEventTime(event, false, $selectedDate);
    openEventFromOtherApp(event, true);
  }
</script>

<style>
  .new-event-button :global(.add-button) {
    margin: 4px;
    align-items: center;
    justify-content: center;
    position: relative;
  }
</style>
