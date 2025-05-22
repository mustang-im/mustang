<vbox flex class="calendar-app">
  <Splitter initialRightRatio={0.2}
    showLeft={!($showEditFullWindow && $selectedApp instanceof EventEditMustangApp)}
    showRight={$selectedApp instanceof EventEditMustangApp}>
    <vbox flex class="main" slot="left">
      <MainView {events} bind:start={$startDate} dateInterval={$selectedDateInterval}>
        <TitleBarLeft on:addEvent={() => catchErrors(addEvent)} slot="top-left" />
        <ViewSelector bind:dateInterval={$selectedDateInterval} slot="top-right" />
      </MainView>
    </vbox>
    <vbox flex class="sidebar" slot="right">
      <EditEvent event={$selectedApp.mainWindowProperties.event} />
    </vbox>
  </Splitter>
</vbox>

<script lang="ts">
  import { selectedCalendar, selectedDate, selectedDateInterval, startDate } from "./selected";
  import { getLocalStorage } from "../Util/LocalStorage";
  import { calendarMustangApp, EventEditMustangApp, showEditFullWindow } from "./CalendarMustangApp";
  import { selectedApp } from "../AppsBar/selectedApp";
  import { appGlobal } from "../../logic/app";
  import MainView from "./MainView.svelte";
  import ViewSelector from "./ViewSelector.svelte";
  import TitleBarLeft from "./TitleBarLeft.svelte";
  import { catchErrors } from "../Util/error";
  import { assert } from "../../logic/util/util";
  import { mergeColls } from "svelte-collections";
  import { t } from "../../l10n/l10n";
  import Splitter from "../Shared/Splitter.svelte";
  import EditEvent from "./EditEvent/EditEvent.svelte";

  $: events = mergeColls(appGlobal.calendars.map(cal => cal.fillRecurrences())).filter(ev => !ev.recurrenceRule).sortBy(ev => ev.startTime);
  $: if (!$selectedCalendar) { $selectedCalendar = appGlobal.calendars.first; }

  let defaultLengthInMinutes = Math.max(getLocalStorage("calendar.defaultEventLengthInMinutes", 60).value, 1);

  $: showEditSidebar = !$showEditFullWindow && $selectedApp instanceof EventEditMustangApp;

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
