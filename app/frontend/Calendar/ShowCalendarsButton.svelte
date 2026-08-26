<RoundButton
  label={$isCalendarListOpen ? $t`Hide the calendars` : $t`Show the calendars`}
  icon={CalendarIcon}
  iconSize="18px"
  padding="6px"
  border={false}
  selected={$isCalendarListOpen}
  onClick={() => $isCalendarListOpen = !$isCalendarListOpen}
  />

<script lang="ts">
  import { isCalendarListOpen } from "./selected";
  import RoundButton from "../Shared/RoundButton.svelte";
  import CalendarIcon from "lucide-svelte/icons/calendar";
  import { t } from "../../l10n/l10n";
</script>
