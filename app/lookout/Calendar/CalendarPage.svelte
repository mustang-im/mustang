<vbox flex class="calendar-page">
  <CalendarRibbon {view}
    bind:splitView bind:timeScale bind:showFolderPane bind:showWeekNumbers bind:showDeclined
    onView={setView} onToday={goToToday} onNext7Days={showNext7Days} onGoToDate={openGoToDate} />
  <hbox flex class="panes">
    <Splitter name="lookout.calendar.folderPane" hasLeft={showFolderPane}
      initialRightRatio={5} leftMinWidth={230} rightMinWidth={480}>
      <vbox flex class="folder-pane" slot="left">
        <DateNavigator {range} date={$startDate} {showWeekNumbers} onSelectDay={selectDay} />
        <hbox class="divider" />
        <CalendarList />
      </vbox>
      <vbox flex class="main lo-card" slot="right">
        <CalendarHeader {range} {view} onToday={goToToday} onStep={step} onView={setView} />
        {#if view == "month"}
          <MonthGrid {range} events={visibleEvents} {showWeekNumbers} onOpenDay={openDay} />
        {:else}
          <TimeGrid {range} {groups} {timeScale} onOpenDay={openDay} onOverlay={() => setSplitView(false)} />
        {/if}
      </vbox>
    </Splitter>
  </hbox>
</vbox>

<EventContextMenu bind:this={eventMenu} />
<SlotContextMenu bind:this={slotMenu} onToday={goToToday} onNext7Days={showNext7Days} onView={setView} />
<GoToDateDialog bind:this={goToDateDialog} onGoTo={goToDate} />
{#if $eventPeek}
  {#key $eventPeek}
    <EventPeek peek={$eventPeek} />
  {/key}
{/if}

<svelte:window on:keydown={onKeyDown} />

<script lang="ts">
  import type { Event } from "../../logic/Calendar/Event";
  import { InvitationResponse } from "../../logic/Calendar/Invitation/InvitationStatus";
  import { CalendarSettings, type CalendarViewType } from "./CalendarSettings";
  import { CalendarRange } from "./View/CalendarRange";
  import { CalendarActions } from "./CalendarActions";
  import { CalendarKeys, type CalendarCommand } from "./CalendarKeys";
  import { eventPeek, selectedSlots, kCalendarMenus, type CalendarMenus, type SlotSelection } from "./Selected";
  import { selectedCalendar, selectedDate, selectedEvent, shownCalendars, shownCalendarEvents, startDate } from "../../frontend/Calendar/selected";
  import { appGlobal } from "../../logic/app";
  import { getToday } from "../../frontend/Util/date";
  import { catchErrors } from "../../frontend/Util/error";
  import { statusBar } from "../MainWindow/StatusBar";
  import CalendarRibbon from "./CalendarRibbon.svelte";
  import DateNavigator from "./FolderPane/DateNavigator.svelte";
  import CalendarList from "./FolderPane/CalendarList.svelte";
  import CalendarHeader from "./View/CalendarHeader.svelte";
  import TimeGrid, { type CalendarColumnGroup } from "./TimeGrid/TimeGrid.svelte";
  import MonthGrid from "./Month/MonthGrid.svelte";
  import EventContextMenu from "./Event/EventContextMenu.svelte";
  import EventPeek from "./Event/EventPeek.svelte";
  import SlotContextMenu from "./View/SlotContextMenu.svelte";
  import GoToDateDialog from "./View/GoToDateDialog.svelte";
  import Splitter from "../../frontend/Shared/Splitter.svelte";
  import type { Collection } from "svelte-collections";
  import { onDestroy, setContext } from "svelte";
  import { t } from "../../l10n/l10n";

  let view = CalendarSettings.view.value;
  let dayCount = CalendarSettings.dayCount.value;
  let timeScale = CalendarSettings.timeScale.value;
  let splitView = CalendarSettings.splitView.value;
  let showFolderPane = CalendarSettings.folderPane.value;
  let showWeekNumbers = CalendarSettings.weekNumbers.value;
  let showDeclined = CalendarSettings.showDeclined.value;

  let eventMenu: EventContextMenu;
  let slotMenu: SlotContextMenu;
  let goToDateDialog: GoToDateDialog;

  setContext<CalendarMenus>(kCalendarMenus, {
    openEventMenu(mouseEvent: MouseEvent, event: Event) {
      eventMenu.openFor(mouseEvent, event);
    },
    openSlotMenu(mouseEvent: MouseEvent, slots: SlotSelection) {
      slotMenu.openFor(mouseEvent);
    },
  });

  $: if (!$selectedCalendar) {
    $selectedCalendar = appGlobal.calendars.first;
  }

  $: range = new CalendarRange(view, $startDate, view == "day" ? dayCount : 1);

  function visible(events: Collection<Event>, showDeclined: boolean): Collection<Event> {
    return showDeclined
      ? events
      : events.filterObservable(event => event.myParticipation != InvitationResponse.Decline);
  }

  $: visibleEvents = visible(shownCalendarEvents, showDeclined);
  $: isSplit = splitView && view != "month" && $shownCalendars.length > 1;
  $: groups = (isSplit
    ? $shownCalendars.contents.map(calendar => ({ calendar, events: visible(calendar.eventsWithRecurrences, showDeclined) }))
    : [{ calendar: null, events: visibleEvents }]) as CalendarColumnGroup[];

  $: eventsInRange = visibleEvents.filterObservable(event => event.startTime < range.end && event.endTime > range.start);
  const status = statusBar.addSection();
  onDestroy(() => status.remove());
  $: status.left = [ { label: $t`Items: ${$eventsInRange.length}` } ];

  function setView(newView: CalendarViewType) {
    if (newView == "day") {
      setDayCount(1);
    }
    view = newView;
    CalendarSettings.view.value = newView;
    $eventPeek = null;
  }

  function setDayCount(days: number) {
    dayCount = days;
    CalendarSettings.dayCount.value = days;
  }

  function setSplitView(split: boolean) {
    splitView = split;
    CalendarSettings.splitView.value = split;
  }

  function goToToday() {
    $startDate = getToday();
    $selectedDate = getToday();
  }

  function showNext7Days() {
    goToToday();
    view = "day";
    CalendarSettings.view.value = "day";
    setDayCount(7);
  }

  function step(direction: number) {
    $eventPeek = null;
    $startDate = CalendarRange.step(view, $startDate, dayCount, direction);
  }

  function selectDay(day: Date) {
    $startDate = day;
    $selectedDate = day;
  }

  function openDay(day: Date) {
    selectDay(day);
    setView("day");
  }

  function openGoToDate() {
    goToDateDialog.open($startDate, view);
  }

  function goToDate(date: Date, newView: CalendarViewType) {
    selectDay(date);
    setView(newView);
  }

  function onKeyDown(keyEvent: KeyboardEvent) {
    let target = keyEvent.target as HTMLElement;
    if (keyEvent.defaultPrevented ||
        target?.closest?.("input, textarea, select, [contenteditable=''], [contenteditable='true'], dialog")) {
      return;
    }
    let command = CalendarKeys.commandFor(keyEvent);
    if (!command || command.command == "open" && target?.closest?.("button, a")) {
      return;
    }
    keyEvent.preventDefault();
    catchErrors(() => runCommand(command));
  }

  async function runCommand(command: CalendarCommand) {
    let event = $selectedEvent;
    switch (command.command) {
    case "new-appointment":
      CalendarActions.newEventAtSelection(null);
      break;
    case "new-meeting":
      CalendarActions.newEventAtSelection(null, "meeting");
      break;
    case "view":
      setView(command.view);
      break;
    case "day-count":
      view = "day";
      CalendarSettings.view.value = "day";
      setDayCount(command.days);
      break;
    case "go-to-date":
      openGoToDate();
      break;
    case "today":
      goToToday();
      break;
    case "step-days":
      $startDate = new Date($startDate.getFullYear(), $startDate.getMonth(), $startDate.getDate() + command.days);
      break;
    case "step-months":
      $startDate = new Date($startDate.getFullYear(), $startDate.getMonth() + command.months, 1);
      break;
    case "step-period":
      step(command.direction);
      break;
    case "open":
      if (event) {
        $eventPeek = null;
        CalendarActions.open(event);
      }
      break;
    case "delete":
      if (event) {
        $eventPeek = null;
        await CalendarActions.deleteDefault(event);
      }
      break;
    case "forward":
      if (event && !event.isCancelled) {
        await CalendarActions.forward(event);
      }
      break;
    case "escape":
      $eventPeek = null;
      $selectedSlots = null;
      break;
    }
  }
</script>

<style>
  .calendar-page {
    min-height: 0;
  }
  .panes {
    min-height: 0;
  }
  .folder-pane {
    min-height: 0;
    overflow-y: auto;
    padding-inline-start: 4px;
  }
  .divider {
    flex: none;
    height: 1px;
    margin: 4px 12px;
    background-color: var(--lo-divider);
  }
  .main {
    min-width: 0;
    min-height: 0;
    margin: 0 8px 8px 0;
    overflow: hidden;
  }
</style>
