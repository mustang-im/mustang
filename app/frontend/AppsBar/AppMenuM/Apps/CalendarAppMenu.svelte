<hbox class="empty" />
<hbox class="empty" />
<AppButton app={calendarMustangApp} page="/calendar/" />
<CombinedButton icon1={calendarMustangApp.icon} icon2={SearchIcon} page="/calendar/search" />
<CombinedButton icon1={calendarMustangApp.icon} icon2={PlusIcon} onClick={onCreateEvent} />

<script lang="ts">
  import { calendarMustangApp } from "../../../Calendar/CalendarMustangApp";
  import { selectedCalendar } from "../../../Calendar/selected";
  import { appGlobal } from "../../../../logic/app";
  import AppButton from "../AppButton.svelte";
  import CombinedButton from "../CombinedButton.svelte";
  import SearchIcon from "lucide-svelte/icons/search";
  import PlusIcon from "lucide-svelte/icons/plus-circle";
  import { assert } from "../../../../logic/util/util";

  function onCreateEvent() {
    let calendar = $selectedCalendar ?? appGlobal.calendars.first;
    assert(calendar, "Create a calendar first");
    let event = calendar.newEvent();
    calendarMustangApp.showEvent(event);
  }
</script>
