<vbox flex class="calendar-app">
  <Splitter
    initialRightRatio={0.25}
    rightMinWidth={250}
    hasRight={!appGlobal.isMobile}
    >
    <vbox flex class="main" slot="left" class:mobile={$appGlobal.isMobile}>
      <MainView events={appGlobal.calendarEvents} bind:start={$startDate} dateInterval={$selectedDateInterval}>
        <hbox slot="top-left">
          {#if !$appGlobal.isMobile}
            <TitleBarLeft />
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
  import { selectedCalendar, selectedDateInterval, selectedEvent, startDate } from "./selected";
  import { appGlobal } from "../../logic/app";
  import MainView from "./MainView.svelte";
  import CalendarViewBarM from "./MonthView/CalenderViewBarM.svelte";
  import TitleBarLeft from "./TitleBarLeft.svelte";
  import TitleBarRight from "./TitleBarRight.svelte";
  import ShowEvent from "./DisplayEvent/ShowEvent.svelte";
  import CalendarInBackground from "./CalendarInBackground.svelte";
  import Splitter from "../Shared/Splitter.svelte";

  $: cals = appGlobal.calendars;
  $: if ($cals.length > 1 &&
          cals.first.protocol == "calendar-local" &&
          cals.get(1).protocol != "calendar-local" &&
          cals.first.events.isEmpty) {
        cals.remove(cals.first);
        // but don't delete it in DB, so that it re-appears after the last cal was deleted (and an app restart)
      }
  $: if (!$selectedCalendar) { $selectedCalendar = cals.first; }
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
