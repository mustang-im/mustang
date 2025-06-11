<vbox flex class="calendar-app">
  <Splitter
    hasRight={!!$selectedEvent}
    initialRightRatio={0.25}
    rightMinWidth={350}
    >
    <vbox flex class="main" slot="left">
      <MainView {events} bind:start={$startDate} dateInterval={$selectedDateInterval}>
        <TitleBarLeft on:addEvent={() => catchErrors(addEvent)} slot="top-left" />
        <TitleBarRight bind:dateInterval={$selectedDateInterval} slot="top-right" />
      </MainView>
    </vbox>
    <vbox flex class="sidebar" slot="right">
      <EditEvent event={$selectedEvent} />
    </vbox>
  </Splitter>
</vbox>

<script lang="ts">
  import { RecurrenceColl } from "../../logic/Calendar/RecurrenceColl";
  import { calendarMustangApp } from "./CalendarMustangApp";
  import { appGlobal } from "../../logic/app";
  import { selectedCalendar, selectedDate, selectedDateInterval, selectedEvent, startDate } from "./selected";
  import { getLocalStorage } from "../Util/LocalStorage";
  import MainView from "./MainView.svelte";
  import TitleBarLeft from "./TitleBarLeft.svelte";
  import TitleBarRight from "./TitleBarRight.svelte";
  import EditEvent from "./EditEvent/EditEvent.svelte";
  import Splitter from "../Shared/Splitter.svelte";
  import { catchErrors } from "../Util/error";
  import { assert } from "../../logic/util/util";
  import { mergeColls } from "svelte-collections";
  import { t } from "../../l10n/l10n";

  $: events = new RecurrenceColl(mergeColls(appGlobal.calendars.map(cal => cal.events))).unique().sortBy(ev => ev.startTime);
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
