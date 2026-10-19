<MenuItem label={$t`Appointment *=> Create a new appointment in the calendar`} icon={NewAppointmentIcon}
  onClick={() => CalendarActions.newEventAtSelection(null)} />
<MenuItem label={$t`Meeting`} icon={NewMeetingIcon}
  onClick={() => CalendarActions.newEventAtSelection(null, "meeting")} />
<MenuItem label={$t`All Day Event`} icon={AllDayIcon}
  onClick={() => CalendarActions.newEventAtSelection(null, "all-day")} />
<MenuItem label={$t`Recurring Appointment`} icon={RecurringIcon}
  onClick={() => CalendarActions.newEventAtSelection(null, "recurring")} />
<MenuItem label={$t`Recurring Meeting`} icon={RecurringMeetingIcon}
  onClick={() => CalendarActions.newEventAtSelection(null, "recurring-meeting")} />

<script lang="ts">
  import { CalendarActions } from "./CalendarActions";
  import MenuItem from "../Shared/Menu/MenuItem.svelte";
  import NewAppointmentIcon from "lucide-svelte/icons/calendar-plus";
  import NewMeetingIcon from "lucide-svelte/icons/users-round";
  import AllDayIcon from "lucide-svelte/icons/sun";
  import RecurringIcon from "lucide-svelte/icons/repeat";
  import RecurringMeetingIcon from "lucide-svelte/icons/calendar-sync";
  import { t } from "../../l10n/l10n";
</script>
