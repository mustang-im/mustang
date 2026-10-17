<vbox flex class="calendar-page" bind:this={pageEl}>
  <CalendarRibbon {view} {currentView}
    onView={setView} onCurrentView={setCurrentView} onResetView={resetView}
    onToday={goToToday} onNext7Days={showNext7Days} onGoToDate={openGoToDate}>
    {#if isSearch}
      <CalendarSearchTab organizers={searchOrganizers} hasSelectedCalendar={!!$selectedCalendar} />
    {/if}
  </CalendarRibbon>
  <hbox flex class="panes">
    {#if $folderPaneSetting.value == CalendarFolderPane.Minimized}
      <FolderPaneMinimized name={$currentCalendar?.name ?? $t`Calendar`}
        onExpand={() => { folderPaneSetting.value = CalendarFolderPane.Normal; }} />
    {/if}
    <Splitter name="lookout.calendar.folderPane" hasLeft={showFolderPane}
      initialRightRatio={5} leftMinWidth={230} rightMinWidth={480}>
      <vbox flex class="folder-pane" slot="left" bind:clientHeight={folderPaneHeight}>
        <DateNavigator {range} date={$startDate} {showWeekNumbers} monthCount={folderPaneHeight >= 760 ? 2 : 1}
          onSelectDay={selectDay} onSelectWeek={selectWeek} onSelectDays={selectDays} />
        <hbox class="divider" />
        <CalendarList />
      </vbox>
      <hbox flex class="main-area" slot="right">
        <hbox flex class="reading-pane-layout">
          <SplitterBidirectional horizontal={readingPane == "bottom"}
            hasSecond={readingPane == "right" || readingPane == "bottom"}
            name={readingPane == "bottom" ? "lookout.calendar.readingPane.bottom" : "lookout.calendar.readingPane.right"}
            initialSecondRatio={readingPane == "bottom" ? 1.4 : 0.6}
            firstMinPx={readingPane == "bottom" ? 160 : 300}
            secondMinPx={readingPane == "bottom" ? 200 : 320}>
            <hbox flex class="part list" slot="first"
              class:top={readingPane == "bottom"}
              class:single={readingPane != "right" && readingPane != "bottom"}>
              <vbox flex class="main lo-card">
                {#if tableEvents}
                  <ListView events={tableEvents} />
                {:else if view == "dual"}
                  <DualView bind:start={$startDate} events={visibleEvents} {groups}>
                    <ViewSelector slot="top-right" {view} onView={setView} />
                  </DualView>
                {:else}
                  <DateRange {range} onToday={goToToday} onStep={step}>
                    <ViewSelector {view} onView={setView} />
                  </DateRange>
                  <vbox flex class="grid-area">
                    {#if view == "month" && isSplit}
                      <hbox flex class="month-split">
                        {#each groups as group, g (group.calendar.id)}
                          <vbox flex class="month-column">
                            <div class="month-tab">
                              <CalendarTab calendar={group.calendar} firstColumn={1} span={1}
                                isFirst={g == 0} onOverlay={() => setSplitView(false)} />
                            </div>
                            <MonthView {range} events={group.events} onOpenDay={openDay} />
                          </vbox>
                        {/each}
                      </hbox>
                    {:else if view == "month"}
                      <MonthView {range} events={visibleEvents} onOpenDay={openDay} />
                    {:else if view == "schedule"}
                      <ScheduleView {range} rows={scheduleRows} />
                    {:else}
                      <DayViewGrid {range} {groups} onOpenDay={openDay} onOverlay={() => setSplitView(false)} />
                    {/if}
                    {#if view != "schedule"}
                      <AdjacentEventTabs {range} events={visibleEvents} isRangeEmpty={!$eventsInRange.length} startOffset={view == "month" ? 0 : 56} onGoTo={goToEvent} />
                    {/if}
                  </vbox>
                {/if}
              </vbox>
            </hbox>
            <hbox flex class="part reading" slot="second"
              class:right={readingPane == "right"}
              class:bottom={readingPane == "bottom"}>
              <DisplayEvent event={$selectedEvent} />
            </hbox>
          </SplitterBidirectional>
        </hbox>
      </hbox>
    </Splitter>
  </hbox>

  <EventMenu bind:this={eventMenu} />
  <SlotMenu bind:this={slotMenu} onToday={goToToday} onNext7Days={showNext7Days} onView={setView} />
  {#if isGoToDateOpen}
    <GoToDateDialog date={rangeDate} {view} onGoTo={goToDate} on:close={() => isGoToDateOpen = false} />
  {/if}
  {#if $openCalendarProperties}
    {#key $openCalendarProperties}
      <CalendarPropertiesDialog calendar={$openCalendarProperties.calendar} tab={$openCalendarProperties.tab}
        on:close={() => $openCalendarProperties = null} />
    {/key}
  {/if}
  {#if $openSharedCalendar}
    <OpenCalendarDialog fromAddressBook={$openSharedCalendar.fromAddressBook} on:close={() => $openSharedCalendar = null} />
  {/if}
  {#if $eventPeek}
    {#key $eventPeek}
      <EventPeek event={$eventPeek.event} anchor={$eventPeek.anchor} />
    {/key}
  {/if}
</vbox>

<svelte:window on:keydown={onKeyDown} />

<script lang="ts">
  import type { Event } from "../../logic/Calendar/Event";
  import { InvitationResponse } from "../../logic/Calendar/Invitation/InvitationStatus";
  import { CalendarRange } from "./CalendarRange";
  import { CalendarActions } from "./CalendarActions";
  import { openEvent } from "../../frontend/Calendar/open";
  import { openComposer } from "../../frontend/Mail/open";
  import { OutgoingInvitation } from "../../logic/Calendar/Invitation/OutgoingInvitation";
  import { CalendarKeys, type CalendarCommand } from "./CalendarKeys";
  import { eventPeek, inlineTitle, selectedSlots, workWeekHours, kCalendarMenus, updatingCount, CalendarCurrentView, CalendarFolderPane, calendarSearchOptions, listedEvents, allListedEvents, CalendarSearchScope, type CalendarSearchOptions, type CalendarMenus, type CalendarViewType, type SlotSelection } from "./selected";
  import { EventTable, EventTableColumn, EventTableGrouping } from "./ListView/EventTable";
  import { selectedCalendar, selectedDate, selectedEvent, shownCalendars, shownCalendarEvents, startDate } from "../../frontend/Calendar/selected";
  import { appGlobal } from "../../logic/app";
  import { getToday } from "../../frontend/Util/date";
  import { getLocalStorage } from "../../frontend/Util/LocalStorage";
  import { catchErrors } from "../../frontend/Util/error";
  import { statusBarContent, type StatusBarContent } from "../MainWindow/StatusBar.svelte";
  import CalendarRibbon from "./CalendarRibbon.svelte";
  import DateNavigator from "./DateNavigator.svelte";
  import CalendarList from "./CalendarList.svelte";
  import FolderPaneMinimized from "../Shared/FolderPaneMinimized.svelte";
  import DateRange from "./DateRange.svelte";
  import ViewSelector from "./ViewSelector.svelte";
  import DualView from "./DualView.svelte";
  import DayViewGrid, { type CalendarColumnGroup } from "./DayView/DayViewGrid.svelte";
  import MonthView from "./MonthView/MonthView.svelte";
  import CalendarTab from "./DayView/CalendarTab.svelte";
  import ScheduleView from "./ScheduleView/ScheduleView.svelte";
  import EventMenu from "./DisplayEvent/EventMenu.svelte";
  import EventPeek from "./DisplayEvent/EventPeek.svelte";
  import DisplayEvent from "./DisplayEvent/DisplayEvent.svelte";
  import type { ReadingPanePosition } from "../Mail/3pane/3Pane.svelte";
  import SlotMenu from "./SlotMenu.svelte";
  import GoToDateDialog from "./GoToDateDialog.svelte";
  import CalendarPropertiesDialog, { openCalendarProperties } from "./CalendarPropertiesDialog.svelte";
  import OpenCalendarDialog, { openSharedCalendar } from "./OpenCalendarDialog.svelte";
  import AdjacentEventTabs from "./AdjacentEventTabs.svelte";
  import ListView from "./ListView/ListView.svelte";
  import CalendarSearchTab from "./ListView/CalendarSearchTab.svelte";
  import { CalendarSearch } from "./ListView/CalendarSearch";
  import type { Calendar } from "../../logic/Calendar/Calendar";
  import Splitter from "../../frontend/Shared/Splitter.svelte";
  import SplitterBidirectional from "../../frontend/Shared/SplitterBidirectional.svelte";
  import { globalSearchTerm } from "../../frontend/AppsBar/selectedApp";
  import type { Collection } from "svelte-collections";
  import { onDestroy, setContext } from "svelte";
  import { derived, get } from "svelte/store";
  import { t } from "../../l10n/l10n";

  const viewSetting = getLocalStorage<CalendarViewType>("lookout.calendar.view", "workweek");
  const currentViewSetting = getLocalStorage<CalendarCurrentView>("lookout.calendar.currentView", CalendarCurrentView.Calendar);
  const dayCountSetting = getLocalStorage<number>("lookout.calendar.dayCount", 1);
  let view = viewSetting.value;
  let currentView = currentViewSetting.value;
  let dayCount = dayCountSetting.value;
  const timeScaleSetting = getLocalStorage<number>("lookout.calendar.timeScale", 30);
  const weekNumbersSetting = getLocalStorage<boolean>("lookout.calendar.weekNumbers", false);
  const showDeclinedSetting = getLocalStorage<boolean>("lookout.calendar.showDeclined", true);
  $: showWeekNumbers = $weekNumbersSetting.value;
  $: showDeclined = $showDeclinedSetting.value;
  const splitViewSetting = getLocalStorage<boolean>("lookout.calendar.splitView", false);
  const readingPaneSetting = getLocalStorage<ReadingPanePosition>("lookout.calendar.readingPane", "off");
  $: readingPane = $readingPaneSetting.value ?? "off";
  $: splitView = $splitViewSetting.value;
  const folderPaneSetting = getLocalStorage<CalendarFolderPane>("lookout.calendar.folderPaneMode", CalendarFolderPane.Normal);
  $: showFolderPane = ($folderPaneSetting.value ?? CalendarFolderPane.Normal) == CalendarFolderPane.Normal;

  let folderPaneHeight = 0;
  let eventMenu: EventMenu;
  let slotMenu: SlotMenu;
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
  $: currentCalendar = $selectedCalendar;

  $: rangeDate = view == "dual" ? $selectedDate : $startDate;
  $: range = new CalendarRange(view, rangeDate, view == "day" || view == "schedule" ? dayCount : 1, $workWeekHours.workDays());

  function visible(events: Collection<Event>, showDeclined: boolean): Collection<Event> {
    return showDeclined
      ? events
      : events.filterObservable(event => event.myParticipation != InvitationResponse.Decline);
  }

  $: visibleEvents = visible(shownCalendarEvents, showDeclined);
  $: isSplit = splitView && view != "schedule" && $shownCalendars.length > 1;
  $: scheduleRows = $shownCalendars.contents.map(calendar => ({ calendar, events: visible(calendar.eventsWithRecurrences, showDeclined) })) as CalendarColumnGroup[];
  $: groups = (isSplit
    ? $shownCalendars.contents.map(calendar => ({ calendar, events: visible(calendar.eventsWithRecurrences, showDeclined) }))
    : [{ calendar: null, events: visibleEvents }]) as CalendarColumnGroup[];

  $: eventsInRange = derived(visibleEvents, events => events.contents.filter(event => event.startTime < range.end && event.endTime > range.start));

  $: searchTerm = $globalSearchTerm?.trim() || null;
  $: isSearch = !!searchTerm;
  $: searchResults = searchTerm
    ? searchedEvents(searchTerm, $calendarSearchOptions, $selectedCalendar)
    : null;
  $: searchOrganizers = searchTerm ? CalendarSearch.organizers(searchedEvents(searchTerm, { ...$calendarSearchOptions, organizerEMail: null }, $selectedCalendar).contents) : [];
  $: listEvents = currentView == CalendarCurrentView.List ? listedEvents
    : currentView == CalendarCurrentView.Active ? listedEvents.filterObservable(event => event.isUpcoming())
    : null;
  $: tableEvents = searchResults ?? listEvents;

  let status: StatusBarContent;
  $: status = {
    left: [ { label: $t`Items: ${tableEvents ? $tableEvents.length : $eventsInRange.length}` } ],
    right: $updatingCount ? [ { label: $t`Updating calendars…`, busy: true } ] : [],
    views: [],
  };
  // <copied from="../Mail/MailApp.svelte">
  $: $statusBarContent = status;
  onDestroy(() => {
    if (get(statusBarContent) == status) {
      statusBarContent.set(null);
    }
  });
  // </copied>

  function setView(newView: CalendarViewType) {
    if (newView == "day" || newView == "schedule") {
      setDayCount(1);
    }
    if (newView == "dual" && !range.contains($selectedDate)) {
      $selectedDate = $startDate;
    } else if (view == "dual" && newView != "dual" && newView != "month") {
      $startDate = $selectedDate;
    }
    view = newView;
    viewSetting.value = newView;
    $eventPeek = null;
    showCalendar();
  }

  function searchedEvents(term: string, options: CalendarSearchOptions, calendar: Calendar | null): Collection<Event> {
    let scope = options.scope == CalendarSearchScope.CurrentFolder && calendar
      ? calendar.events.filterObservable(event => EventTable.isListed(event))
      : allListedEvents;
    return scope.filterObservable(event => event.matchesSearch(term.trim().toLowerCase()) &&
      (!options.isRecurring || !!event.recurrenceRule) &&
      (!options.hasAttachments || event.attachments.hasItems) &&
      (!options.organizerEMail || event.organizer?.emailAddress == options.organizerEMail));
  }

  // <copied to="ListView/CalendarSearchTab.svelte">
  function closeSearch() {
    $globalSearchTerm = null;
    $calendarSearchOptions = { scope: $calendarSearchOptions.scope, isRecurring: false, hasAttachments: false, organizerEMail: null };
  }
  // </copied>

  function setCurrentView(newView: CalendarCurrentView) {
    currentView = newView;
    currentViewSetting.value = newView;
    $eventPeek = null;
    if (isSearch) {
      closeSearch();
    }
  }

  function showCalendar() {
    if (currentView == CalendarCurrentView.List || currentView == CalendarCurrentView.Active) {
      setCurrentView(CalendarCurrentView.Calendar);
    } else if (isSearch) {
      closeSearch();
    }
  }

  function resetView() {
    const listSettings = [
      getLocalStorage<EventTableColumn>("lookout.calendar.list.sortColumn", EventTableColumn.Start),
      getLocalStorage<boolean>("lookout.calendar.list.sortAscending", true),
      getLocalStorage<EventTableGrouping>("lookout.calendar.list.grouping", EventTableGrouping.Recurrence),
      getLocalStorage<EventTableColumn[]>("lookout.calendar.list.columns", EventTable.defaultColumns),
    ];
    folderPaneSetting.value = CalendarFolderPane.Normal;
    readingPaneSetting.value = "off";
    setCurrentView(CalendarCurrentView.Calendar);
    setView("workweek");
    setSplitView(false);
    timeScaleSetting.value = timeScaleSetting.defaultValue;
    for (let setting of listSettings) {
      setting.value = setting.defaultValue;
    }
  }

  function setDayCount(days: number) {
    dayCount = days;
    dayCountSetting.value = days;
  }

  function setSplitView(split: boolean) {
    splitViewSetting.value = split;
  }

  function goToToday() {
    $startDate = getToday();
    $selectedDate = getToday();
    showCalendar();
  }

  function showNext7Days() {
    goToToday();
    view = "day";
    viewSetting.value = "day";
    setDayCount(7);
  }

  function step(direction: number) {
    $eventPeek = null;
    setRangeDate(CalendarRange.step(view, rangeDate, dayCount, direction));
  }

  function setRangeDate(date: Date) {
    if (view == "dual") {
      $selectedDate = date;
    } else {
      $startDate = date;
    }
  }

  function selectDay(day: Date) {
    $startDate = day;
    $selectedDate = day;
    showCalendar();
  }

  function selectWeek(firstDay: Date) {
    selectDay(firstDay);
    setView("week");
  }

  function selectDays(first: Date, last: Date) {
    selectDay(first);
    view = "day";
    viewSetting.value = "day";
    setDayCount(Math.round((last.getTime() - first.getTime()) / (24 * 60 * 60 * 1000)) + 1);
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
      setView("day");
      setDayCount(command.days);
      break;
    case "go-to-date":
      openGoToDate();
      break;
    case "today":
      goToToday();
      break;
    case "step-days":
      setRangeDate(new Date(rangeDate.getFullYear(), rangeDate.getMonth(), rangeDate.getDate() + command.days));
      break;
    case "step-months":
      $startDate = new Date($startDate.getFullYear(), $startDate.getMonth() + command.months, 1);
      break;
    case "step-period":
      step(command.direction);
      break;
    case "week-edge":
      selectDay(CalendarRange.weekEdge($selectedDate, command.isEnd));
      break;
    case "open":
      if (event) {
        $eventPeek = null;
        openEvent(event, true);
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
        openComposer(await OutgoingInvitation.forwardEventByMail(event));
      }
      break;
    case "escape":
      if (isSearch) {
        closeSearch();
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
  .month-split {
    gap: 8px;
    min-height: 0;
  }
  .month-column {
    min-width: 0;
    min-height: 0;
  }
  .month-tab {
    display: grid;
    grid-template-columns: 1fr;
    padding-inline: 4px;
  }
  .grid-area {
    position: relative;
    min-height: 0;
  }
  .main-area {
    min-width: 0;
    min-height: 0;
  }
  .main {
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }
  /* <copied from="../Mail/3pane/3Pane.svelte"> */
  .reading-pane-layout {
    min-width: 0;
    min-height: 0;
  }
  .reading-pane-layout > :global(.splitter) {
    flex: 1 0 0;
    min-width: 0;
  }
  .part {
    min-width: 0;
    min-height: 0;
    height: 100%;
    box-sizing: border-box;
  }
  .list {
    padding: 0 4px 8px 0;
  }
  .list.single {
    padding-inline-end: 8px;
  }
  .list.top {
    padding: 0 8px 4px 0;
  }
  .reading.right {
    padding: 0 8px 8px 4px;
  }
  .reading.bottom {
    padding: 4px 8px 8px 0;
  }
  .part :global(> *) {
    flex: 1 0 0;
  }
  /* </copied> */
</style>
