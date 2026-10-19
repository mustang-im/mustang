<ContextMenu bind:this={contextMenu}>
  <MenuItem label={$t`New Appointment`} icon={NewAppointmentIcon} shortCutInfo={$t`Ctrl+N *=> Keyboard shortcut`}
    onClick={() => CalendarActions.newEventAtSelection(null)} />
  <MenuItem label={$t`New All Day Event`} icon={AllDayIcon}
    onClick={() => CalendarActions.newEventAtSelection(null, "all-day")} />
  <MenuItem label={$t`New Meeting Request`} icon={NewMeetingIcon} shortCutInfo={$t`Ctrl+Shift+Q *=> Keyboard shortcut`}
    onClick={() => CalendarActions.newEventAtSelection(null, "meeting")} />
  <MenuItem label={$t`New Recurring Appointment`} icon={RecurringIcon}
    onClick={() => CalendarActions.newEventAtSelection(null, "recurring")} />
  <MenuItem label={$t`New Recurring Meeting`} icon={RecurringMeetingIcon}
    onClick={() => CalendarActions.newEventAtSelection(null, "recurring-meeting")} />
  <MenuDivider />
  <MenuItem label={$t`Today *=> Show today in the calendar`} icon={TodayIcon} onClick={goToToday} />
  <MenuItem label={$t`Next 7 Days`} icon={NextDaysIcon} onClick={showNext7Days} />
  <MenuDivider />
  <MenuItem label={$t`Day *=> Calendar view that shows one day`} icon={DayIcon} shortCutInfo={$t`Ctrl+Alt+1 *=> Keyboard shortcut`} onClick={() => setView("day")} />
  <MenuItem label={$t`Work Week *=> Calendar view that shows Monday to Friday`} icon={WorkWeekIcon} shortCutInfo={$t`Ctrl+Alt+2 *=> Keyboard shortcut`} onClick={() => setView("workweek")} />
  <MenuItem label={$t`Week *=> Calendar view that shows a whole week`} icon={WeekIcon} shortCutInfo={$t`Ctrl+Alt+3 *=> Keyboard shortcut`} onClick={() => setView("week")} />
  <MenuItem label={$t`Month *=> Calendar view that shows a whole month`} icon={MonthIcon} shortCutInfo={$t`Ctrl+Alt+4 *=> Keyboard shortcut`} onClick={() => setView("month")} />
  <MenuItem label={$t`Schedule View`} icon={ScheduleIcon} shortCutInfo={$t`Ctrl+Alt+5 *=> Keyboard shortcut`} onClick={() => setView("schedule")} />
  <MenuItem label={$t`Day/Month *=> Calendar view with the day on the left and the month on the right`} icon={DualIcon} onClick={() => setView("dual")} />
  <MenuDivider />
  <MenuItem label={$t`View Settings…`} icon={ViewSettingsIcon} onClick={() => isViewSettingsOpen = true} />
</ContextMenu>
{#if isViewSettingsOpen}
  <ViewSettingsDialog on:close={() => isViewSettingsOpen = false} />
{/if}

<script lang="ts">
  import { eventPeek, type CalendarViewType } from "./selected";
  import { CalendarActions } from "./CalendarActions";
  import { selectedDate, startDate } from "../../frontend/Calendar/selected";
  import { getToday } from "../../logic/util/date";
  import ContextMenu from "../Shared/Menu/ContextMenu.svelte";
  import MenuItem from "../Shared/Menu/MenuItem.svelte";
  import MenuDivider from "../Shared/Menu/MenuDivider.svelte";
  import ViewSettingsDialog from "./ViewSettings/ViewSettingsDialog.svelte";
  import NewAppointmentIcon from "lucide-svelte/icons/calendar-plus";
  import NewMeetingIcon from "lucide-svelte/icons/users-round";
  import AllDayIcon from "lucide-svelte/icons/sun";
  import RecurringIcon from "lucide-svelte/icons/repeat";
  import RecurringMeetingIcon from "lucide-svelte/icons/calendar-sync";
  import TodayIcon from "lucide-svelte/icons/calendar-check";
  import NextDaysIcon from "lucide-svelte/icons/calendar-clock";
  import DayIcon from "lucide-svelte/icons/calendar-1";
  import WorkWeekIcon from "lucide-svelte/icons/columns-4";
  import WeekIcon from "lucide-svelte/icons/calendar-range";
  import MonthIcon from "lucide-svelte/icons/calendar-days";
  import ScheduleIcon from "lucide-svelte/icons/chart-gantt";
  import DualIcon from "lucide-svelte/icons/columns-2";
  import ViewSettingsIcon from "lucide-svelte/icons/sliders-horizontal";
  import { t } from "../../l10n/l10n";

  export let view: CalendarViewType;
  export let dayCount: number;

  let contextMenu: ContextMenu;
  let isViewSettingsOpen = false;

  export function openFor(mouseEvent: MouseEvent) {
    contextMenu.onContextMenu(mouseEvent);
  }

  // <copied from="ViewSelector.svelte">
  function setView(viewType: CalendarViewType) {
    view = viewType;
    if (viewType == "day" || viewType == "schedule") {
      dayCount = 1;
    }
    $eventPeek = null;
  }
  // </copied>

  // <copied from="CalendarRibbon.svelte">
  function goToToday() {
    $startDate = getToday();
    $selectedDate = getToday();
  }

  function showNext7Days() {
    goToToday();
    view = "day";
    dayCount = 7;
  }
  // </copied>
</script>
