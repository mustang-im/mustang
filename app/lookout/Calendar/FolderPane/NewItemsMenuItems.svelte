<MenuItem label={$t`Appointment`} icon={NewAppointmentIcon}
  onClick={() => CalendarActions.newEventAtSelection(calendar)} />
<MenuItem label={$t`Meeting`} icon={NewMeetingIcon}
  onClick={() => CalendarActions.newEventAtSelection(calendar, "meeting")} />
<MenuItem label={$t`All Day Event`} icon={AllDayIcon}
  onClick={() => CalendarActions.newEventAtSelection(calendar, "all-day")} />
<MenuItem label={$t`Recurring Appointment`} icon={RecurringIcon}
  onClick={() => CalendarActions.newEventAtSelection(calendar, "recurring")} />
<MenuItem label={$t`Recurring Meeting`} icon={RecurringMeetingIcon}
  onClick={() => CalendarActions.newEventAtSelection(calendar, "recurring-meeting")} />

<script lang="ts">
  import type { Calendar } from "../../../logic/Calendar/Calendar";
  import { CalendarActions } from "../CalendarActions";
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";
  import NewAppointmentIcon from "lucide-svelte/icons/calendar-plus";
  import NewMeetingIcon from "lucide-svelte/icons/users-round";
  import AllDayIcon from "lucide-svelte/icons/sun";
  import RecurringIcon from "lucide-svelte/icons/repeat";
  import RecurringMeetingIcon from "lucide-svelte/icons/calendar-sync";
  import { t } from "../../../l10n/l10n";

  export let calendar: Calendar | null = null;
</script>
