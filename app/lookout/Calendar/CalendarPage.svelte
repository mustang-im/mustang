<vbox flex class="calendar-page" bind:this={pageEl}>
  <CalendarRibbon {view} {currentView}
    bind:splitView {timeScale} bind:showFolderPane
    onView={setView} onCurrentView={setCurrentView} onResetView={resetView}
    onToday={goToToday} onNext7Days={showNext7Days} onGoToDate={openGoToDate}>
    {#if isSearch}
      <CalendarSearchTab organizers={searchOrganizers} hasSelectedCalendar={!!$selectedCalendar} />
      <RibbonTabSelector label={$t`Search`} />
    {/if}
  </CalendarRibbon>
  <hbox flex class="panes">
    <Splitter name="lookout.calendar.folderPane" hasLeft={showFolderPane}
      initialRightRatio={5} leftMinWidth={230} rightMinWidth={480}>
      <vbox flex class="folder-pane" slot="left" bind:clientHeight={folderPaneHeight}>
        <DateNavigator {range} date={$startDate} {showWeekNumbers} monthCount={folderPaneHeight >= 760 ? 2 : 1}
          onSelectDay={selectDay} />
        <hbox class="divider" />
        <CalendarList />
      </vbox>
      <vbox flex class="main lo-card" slot="right">
        {#if tableEvents}
          <EventTable events={tableEvents} label={tableLabel} emptyText={tableEmptyText}
            showCalendarColumn={isSearch && $searchOptions.scope == CalendarSearchScope.AllCalendarItems} />
        {:else}
          <CalendarHeader {range} {view} onToday={goToToday} onStep={step} onView={setView} />
          <vbox flex class="grid-area">
            {#if view == "month"}
              <MonthGrid {range} events={visibleEvents} {showWeekNumbers} onOpenDay={openDay} />
            {:else if view == "schedule"}
              <ScheduleView {range} rows={scheduleRows} {timeScale} />
            {:else}
              <TimeGrid {range} {groups} {timeScale} onOpenDay={openDay} onOverlay={() => setSplitView(false)} />
            {/if}
            {#if view != "schedule"}
              <AdjacentEventTabs {range} events={visibleEvents} isRangeEmpty={!$eventsInRange.length} startOffset={view == "month" ? 0 : 56} onGoTo={goToEvent} />
            {/if}
          </vbox>
        {/if}
      </vbox>
    </Splitter>
  </hbox>

  <EventContextMenu bind:this={eventMenu} />
  <SlotContextMenu bind:this={slotMenu} onToday={goToToday} onNext7Days={showNext7Days} onView={setView} />
  {#if isGoToDateOpen}
    <GoToDateDialog date={$startDate} {view} onGoTo={goToDate} on:close={() => isGoToDateOpen = false} />
  {/if}
  {#if $eventPeek}
    {#key $eventPeek}
      <EventPeek peek={$eventPeek} />
    {/key}
  {/if}
</vbox>

<svelte:window on:keydown={onKeyDown} />

<script lang="ts">
  import type { Event } from "../../logic/Calendar/Event";
  import { InvitationResponse } from "../../logic/Calendar/Invitation/InvitationStatus";
  import { CalendarCurrentView, CalendarSettings, type CalendarViewType } from "./CalendarSettings";
  import { CalendarRange } from "./View/CalendarRange";
  import { CalendarActions } from "./CalendarActions";
  import { CalendarKeys, type CalendarCommand } from "./CalendarKeys";
  import { eventPeek, inlineTitle, selectedSlots, kCalendarMenus, type CalendarMenus, type SlotSelection } from "./Selected";
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
  import ScheduleView from "./ScheduleView/ScheduleView.svelte";
  import EventContextMenu from "./Event/EventContextMenu.svelte";
  import EventPeek from "./Event/EventPeek.svelte";
  import SlotContextMenu from "./View/SlotContextMenu.svelte";
  import GoToDateDialog from "./View/GoToDateDialog.svelte";
  import AdjacentEventTabs from "./View/AdjacentEventTabs.svelte";
  import EventTable from "./ListView/EventTable.svelte";
  import CalendarSearchTab from "./ListView/CalendarSearchTab.svelte";
  import RibbonTabSelector from "../Mail/Ribbon/RibbonTabSelector.svelte";
  import { EventLists } from "./ListView/EventLists";
  import { CalendarSearch, CalendarSearchScope } from "./ListView/CalendarSearch";
  import Splitter from "../../frontend/Shared/Splitter.svelte";
  import { globalSearchTerm } from "../../frontend/AppsBar/selectedApp";
  import type { Collection } from "svelte-collections";
  import { onDestroy, setContext } from "svelte";
  import { t } from "../../l10n/l10n";

  let view = CalendarSettings.view.value;
  let currentView = CalendarSettings.currentView.value;
  let dayCount = CalendarSettings.dayCount.value;
  const timeScaleSetting = CalendarSettings.timeScale;
  const weekNumbersSetting = CalendarSettings.weekNumbers;
  const showDeclinedSetting = CalendarSettings.showDeclined;
  $: timeScale = $timeScaleSetting.value;
  $: showWeekNumbers = $weekNumbersSetting.value;
  $: showDeclined = $showDeclinedSetting.value;
  let splitView = CalendarSettings.splitView.value;
  let showFolderPane = CalendarSettings.folderPane.value;

  let folderPaneHeight = 0;
  let eventMenu: EventContextMenu;
  let slotMenu: SlotContextMenu;
  let isGoToDateOpen = false;
  let pageEl: HTMLElement;

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

  $: range = new CalendarRange(view, $startDate, view == "day" || view == "schedule" ? dayCount : 1);

  function visible(events: Collection<Event>, showDeclined: boolean): Collection<Event> {
    return showDeclined
      ? events
      : events.filterObservable(event => event.myParticipation != InvitationResponse.Decline);
  }

  $: visibleEvents = visible(shownCalendarEvents, showDeclined);
  $: isSplit = splitView && view != "month" && view != "schedule" && $shownCalendars.length > 1;
  $: scheduleRows = $shownCalendars.contents.map(calendar => ({ calendar, events: visible(calendar.eventsWithRecurrences, showDeclined) })) as CalendarColumnGroup[];
  $: groups = (isSplit
    ? $shownCalendars.contents.map(calendar => ({ calendar, events: visible(calendar.eventsWithRecurrences, showDeclined) }))
    : [{ calendar: null, events: visibleEvents }]) as CalendarColumnGroup[];

  $: eventsInRange = visibleEvents.filterObservable(event => event.startTime < range.end && event.endTime > range.start);

  const searchOptions = CalendarSearch.options;
  $: searchTerm = $globalSearchTerm?.trim() || null;
  $: isSearch = !!searchTerm;
  $: searchResults = searchTerm
    ? EventLists.searchResults(searchTerm, $searchOptions, $selectedCalendar)
    : null;
  $: searchOrganizers = searchTerm ? CalendarSearch.organizers(EventLists.searchResults(searchTerm, { ...$searchOptions, organizerEMail: null }, $selectedCalendar).contents) : [];
  $: listEvents = currentView == CalendarCurrentView.List ? EventLists.shown
    : currentView == CalendarCurrentView.Active ? EventLists.active()
    : null;
  $: tableEvents = searchResults ?? listEvents;
  $: tableLabel = isSearch ? $t`Search results` : currentView == CalendarCurrentView.Active ? $t`Active appointments` : $t`All appointments`;
  $: tableEmptyText = isSearch ? $t`We didn't find anything to show here.` : $t`There are no items to show in this view.`;

  const status = statusBar.addSection();
  onDestroy(() => status.remove());
  const updatingCount = CalendarActions.updatingCount;
  $: status.left = [ { label: $t`Items: ${tableEvents ? $tableEvents.length : $eventsInRange.length}` } ];
  $: status.right = $updatingCount ? [ { label: $t`Updating calendars…`, busy: true } ] : [];

  function setView(newView: CalendarViewType) {
    if (newView == "day" || newView == "schedule") {
      setDayCount(1);
    }
    view = newView;
    CalendarSettings.view.value = newView;
    $eventPeek = null;
    showCalendar();
  }

  function setCurrentView(newView: CalendarCurrentView) {
    currentView = newView;
    CalendarSettings.currentView.value = newView;
    $eventPeek = null;
    if (isSearch) {
      CalendarSearch.close();
    }
  }

  function showCalendar() {
    if (currentView == CalendarCurrentView.List || currentView == CalendarCurrentView.Active) {
      setCurrentView(CalendarCurrentView.Calendar);
    } else if (isSearch) {
      CalendarSearch.close();
    }
  }

  function resetView() {
    setCurrentView(CalendarCurrentView.Calendar);
    setView("workweek");
    setSplitView(false);
    CalendarSettings.timeScale.value = CalendarSettings.timeScale.defaultValue;
    CalendarSettings.listSortColumn.value = CalendarSettings.listSortColumn.defaultValue;
    CalendarSettings.listSortAscending.value = CalendarSettings.listSortAscending.defaultValue;
    CalendarSettings.listGrouping.value = CalendarSettings.listGrouping.defaultValue;
    CalendarSettings.listColumns.value = CalendarSettings.listColumns.defaultValue;
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
    showCalendar();
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
    showCalendar();
  }

  function openDay(day: Date) {
    selectDay(day);
    setView("day");
  }

  function goToEvent(event: Event) {
    selectDay(event.startTime);
    $selectedEvent = event;
  }

  function openGoToDate() {
    isGoToDateOpen = true;
  }

  function goToDate(date: Date, newView: CalendarViewType) {
    selectDay(date);
    setView(newView);
  }

  function onKeyDown(keyEvent: KeyboardEvent) {
    let target = keyEvent.target as HTMLElement;
    if (keyEvent.defaultPrevented ||
        !pageEl?.contains(target) && target != document.body ||
        target?.closest?.("input, textarea, select, [contenteditable=''], [contenteditable='true'], dialog")) {
      return;
    }
    let command = CalendarKeys.commandFor(keyEvent);
    if (!command && $selectedSlots && keyEvent.key.length == 1 && keyEvent.key != " " &&
        !keyEvent.ctrlKey && !keyEvent.metaKey && !keyEvent.altKey) {
      keyEvent.preventDefault();
      $eventPeek = null;
      $inlineTitle = keyEvent.key;
      return;
    }
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
      if (isSearch) {
        CalendarSearch.close();
      }
      $eventPeek = null;
      $inlineTitle = null;
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
  .grid-area {
    position: relative;
    min-height: 0;
  }
  .main {
    min-width: 0;
    min-height: 0;
    margin: 0 8px 8px 0;
    overflow: hidden;
  }
</style>
