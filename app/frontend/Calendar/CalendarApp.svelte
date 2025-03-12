<vbox flex class="calendar-app">
  <vbox flex class="main">
    <MainView {events} bind:start={$startDate} dateInterval={$selectedDateInterval}>
      <TitleBarLeft on:addEvent={() => catchErrors(addEvent)} slot="top-left" />
      <ViewSelector bind:dateInterval={$selectedDateInterval} slot="top-right" />
    </MainView>
  </vbox>
</vbox>

<script lang="ts">
  import { selectedCalendar, selectedDate, selectedDateInterval, startDate } from "./selected";
  import { getLocalStorage } from "../Util/LocalStorage";
  import { calendarMustangApp } from "./CalendarMustangApp";
  import { appGlobal } from "../../logic/app";
  import MainView from "./MainView.svelte";
  import ViewSelector from "./ViewSelector.svelte";
  import TitleBarLeft from "./TitleBarLeft.svelte";
  import { catchErrors } from "../Util/error";
  import { assert } from "../../logic/util/util";
  import { mergeColls } from "svelte-collections";
  import { t } from "../../l10n/l10n";

  $: events = mergeColls(appGlobal.calendars.map(cal => cal.fillRecurrences(new Date(Date.now() + 1e11)))).filter(ev => !ev.recurrenceRule).sortBy(ev => ev.startTime);
  $: if (!$selectedCalendar) { $selectedCalendar = appGlobal.calendars.first; }

  let defaultLengthInMinutes = Math.max(getLocalStorage("calendar.defaultEventLengthInMinutes", 60).value, 1);

  function addEvent() {
    assert($selectedCalendar, $t`Please select a calendar first`);
    let event = $selectedCalendar.newEvent();
    event.startTime = new Date($selectedDate);
    event.startTime.setMinutes(0);
    event.startTime.setSeconds(0);
    event.startTime.setMilliseconds(0);
    event.endTime = new Date(event.startTime.getTime());
    event.endTime.setMinutes(event.startTime.getMinutes() + defaultLengthInMinutes);
    calendarMustangApp.editEvent(event);
  }
</script>

<style>
  .main {
    margin: 0px 16px 16px 16px;
  }
  .main :global(.range-header) {
    height: 58px;
    align-items: center;
  }
</style>
