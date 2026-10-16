<RibbonToggleButton label={$t`Day`} icon={DayIcon} shortCutInfo="Ctrl+Alt+1" isRadio
  checked={!isTable && view == "day"} onChange={() => onView("day")} />
<RibbonToggleButton label={$t`Work Week`} icon={WorkWeekIcon} shortCutInfo="Ctrl+Alt+2" isRadio
  checked={!isTable && view == "workweek"} onChange={() => onView("workweek")} />
<RibbonToggleButton label={$t`Week`} icon={WeekIcon} shortCutInfo="Ctrl+Alt+3" isRadio
  checked={!isTable && view == "week"} onChange={() => onView("week")} />
<RibbonToggleButton label={$t`Month`} icon={MonthIcon} shortCutInfo="Ctrl+Alt+4" isRadio
  checked={!isTable && view == "month"} onChange={() => onView("month")} />
<RibbonToggleButton label={$t`Schedule View`} icon={ScheduleIcon} shortCutInfo="Ctrl+Alt+5" isRadio
  tooltip={$t`Show the calendars in rows, with the time running from left to right`}
  checked={!isTable && view == "schedule"} onChange={() => onView("schedule")} />

<script lang="ts">
  import type { CalendarViewType } from "../CalendarSettings";
  import RibbonToggleButton from "../../Shared/Ribbon/RibbonToggleButton.svelte";
  import DayIcon from "lucide-svelte/icons/calendar-1";
  import WorkWeekIcon from "lucide-svelte/icons/columns-4";
  import WeekIcon from "lucide-svelte/icons/calendar-range";
  import MonthIcon from "lucide-svelte/icons/calendar-days";
  import ScheduleIcon from "lucide-svelte/icons/chart-gantt";
  import { t } from "../../../l10n/l10n";

  export let view: CalendarViewType;
  export let isTable: boolean;
  export let onView: (view: CalendarViewType) => void;
</script>
