<hbox class="empty" />
<hbox class="empty" />
<AppButton app={calendarMustangApp} page="/calendar/" />
<CombinedButton icon1={calendarMustangApp.icon} icon2={SearchIcon} page="/calendar/search" />
<CombinedButton icon1={calendarMustangApp.icon} icon2={PlusIcon} page="/calendar/create-event" />

<script lang="ts">
  import { calendarMustangApp } from "../../../Calendar/CalendarMustangApp";
  import AppButton from "../AppButton.svelte";
  import CombinedButton from "../CombinedButton.svelte";
  import SearchIcon from "lucide-svelte/icons/search";
  import PlusIcon from "lucide-svelte/icons/plus-circle";
</script>
