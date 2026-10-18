<RibbonToggleButton label={$t`Day`} icon={DayIcon} shortCutInfo="Ctrl+Alt+1" isRadio
  checked={!isTable && view == "day"} onChange={() => arrange("day")} />
<RibbonToggleButton label={$t`Work Week`} icon={WorkWeekIcon} shortCutInfo="Ctrl+Alt+2" isRadio
  checked={!isTable && view == "workweek"} onChange={() => arrange("workweek")} />
<RibbonToggleButton label={$t`Week`} icon={WeekIcon} shortCutInfo="Ctrl+Alt+3" isRadio
  checked={!isTable && view == "week"} onChange={() => arrange("week")} />
<RibbonToggleButton label={$t`Month`} icon={MonthIcon} shortCutInfo="Ctrl+Alt+4" isRadio
  checked={!isTable && view == "month"} onChange={() => arrange("month")} />
<RibbonToggleButton label={$t`Schedule View`} icon={ScheduleIcon} shortCutInfo="Ctrl+Alt+5" isRadio
  tooltip={$t`Show the calendars in rows, with the time running from left to right`}
  checked={!isTable && view == "schedule"} onChange={() => arrange("schedule")} />
<RibbonToggleButton label={$t`Day/Month`} icon={DualIcon} isRadio
  tooltip={$t`Show the selected day and the next day on the left, and the month on the right`}
  checked={!isTable && view == "dual"} onChange={() => arrange("dual")} />

<script lang="ts">
  import { CalendarCurrentView, type CalendarViewType } from "./selected";
  import RibbonToggleButton from "../Shared/Ribbon/RibbonToggleButton.svelte";
  import DayIcon from "lucide-svelte/icons/calendar-1";
  import WorkWeekIcon from "lucide-svelte/icons/columns-4";
  import WeekIcon from "lucide-svelte/icons/calendar-range";
  import MonthIcon from "lucide-svelte/icons/calendar-days";
  import ScheduleIcon from "lucide-svelte/icons/chart-gantt";
  import DualIcon from "lucide-svelte/icons/columns-2";
  import { t } from "../../l10n/l10n";

  export let view: CalendarViewType;
  export let dayCount: number;
  export let currentView: CalendarCurrentView;

  $: isTable = currentView == CalendarCurrentView.List || currentView == CalendarCurrentView.Active;

  function arrange(viewType: CalendarViewType) {
    setView(viewType);
    if (isTable) {
      currentView = CalendarCurrentView.Calendar;
    }
  }

  // <copied from="ViewSelector.svelte">
  function setView(viewType: CalendarViewType) {
    view = viewType;
    if (viewType == "day" || viewType == "schedule") {
      dayCount = 1;
    }
  }
  // </copied>
</script>
