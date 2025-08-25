<vbox flex class="calendar-app">
  <Splitter
    initialRightRatio={0.25}
    rightMinWidth={350}
    hasRight={!appGlobal.isMobile}
    >
    <vbox flex class="main" slot="left" class:mobile={$appGlobal.isMobile}>
      <MainView events={appGlobal.calendarEvents} bind:start={$startDate} dateInterval={$selectedDateInterval}>
        <hbox slot="top-left">
          {#if !$appGlobal.isMobile}
            <TitleBarLeft on:addEvent={() => catchErrors(addEvent)}  />
          {/if}
        </hbox>
        <TitleBarRight bind:dateInterval={$selectedDateInterval} slot="top-right" />
      </MainView>
    </vbox>
    <vbox flex class="sidebar" slot="right">
      {#if $selectedEvent && !appGlobal.isMobile}
        <ShowEvent event={$selectedEvent} />
      {:else}
        <!--<TaskList />-->
      {/if}
    </vbox>
  </Splitter>
  {#if $appGlobal.isMobile}
    <CalendarViewBarM />
  {/if}
</vbox>
<CalendarInBackground />

<script lang="ts">
  import { calendarMustangApp } from "./CalendarMustangApp";
  import { appGlobal } from "../../logic/app";
  import { selectedCalendar, selectedDate, selectedDateInterval, selectedEvent, startDate } from "./selected";
  import { setNewEventTime } from "./event";
  import MainView from "./MainView.svelte";
  import CalendarViewBarM from "./MonthView/CalenderViewBarM.svelte";
  import TitleBarLeft from "./TitleBarLeft.svelte";
  import TitleBarRight from "./TitleBarRight.svelte";
  import ShowEvent from "./DisplayEvent/ShowEvent.svelte";
  import CalendarInBackground from "./CalendarInBackground.svelte";
  import Splitter from "../Shared/Splitter.svelte";
  import { catchErrors } from "../Util/error";
  import { assert } from "../../logic/util/util";
  import { t } from "../../l10n/l10n";

  $: if (!$selectedCalendar) { $selectedCalendar = appGlobal.calendars.first; }

  function addEvent() {
    $selectedCalendar ??= appGlobal.calendars.first;
    assert($selectedCalendar, $t`Please set up a calendar first`);
    let event = $selectedCalendar.newEvent();
    setNewEventTime(event, false, $selectedDate);
    calendarMustangApp.showEvent(event);
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
  .main.mobile {
    margin-inline-end: 0px;
  }
  .main.mobile :global(.range-header) {
    height: 36px;
  }
</style>
