<hbox class="empty" />
<RoundButton
  label={$t`TODO`}
    icon={TODOsIcon}
  onClick={goToTODOs}
  padding="24px" classes="plain" border={false} />
<AppButton app={calendarMustangApp} page="/calendar/" />
<CombinedButton icon1={calendarMustangApp.icon} icon2={SearchIcon} page="/calendar/search" />
<CombinedButton icon1={calendarMustangApp.icon} icon2={PlusIcon} onClick={onCreateEvent} />

<script lang="ts">
  import { setNewEventTime } from "../../../Calendar/event";
  import { calendarMustangApp } from "../../../Calendar/CalendarMustangApp";
  import { selectedCalendar } from "../../../Calendar/selected";
  import { appGlobal } from "../../../../logic/app";
  import { goTo } from "../../selectedApp";
  import AppButton from "../AppButton.svelte";
  import CombinedButton from "../CombinedButton.svelte";
  import RoundButton from "../../../Shared/RoundButton.svelte";
  import SearchIcon from "lucide-svelte/icons/search";
  import PlusIcon from "lucide-svelte/icons/plus-circle";
  import TODOsIcon from "lucide-svelte/icons/list-checks";
  import { assert } from "../../../../logic/util/util";
  import { t } from "../../../../l10n/l10n";

  function onCreateEvent() {
    let calendar = $selectedCalendar ?? appGlobal.calendars.first;
    assert(calendar, "Create a calendar first");
    let event = calendar.newEvent();
    setNewEventTime(event, false, new Date());
    calendarMustangApp.showEvent(event);
  }

  function goToTODOs() {
    goTo("/calendar/todos", {});
  }
</script>
