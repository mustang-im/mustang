<vbox class="event" flex
  on:click={() => catchErrors(onOpen)}>
  <div class="title">
    {event.title}
  </div>
</vbox>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import { selectedDate, selectedEvent, startDate } from "../../Calendar/selected";
  import { openApp } from "../../AppsBar/selectedApp";
  import { calendarMustangApp } from "../../Calendar/CalendarMustangApp";
  import { catchErrors } from "../../Util/error";

  export let event: Event;

  function onOpen() {
    $selectedEvent = event;
    //calendarMustangApp.editEvent(event);
    $selectedDate = event.startTime;
    $startDate = event.startTime;
    openApp(calendarMustangApp);
  }
</script>

<style>
  .title {
    font-weight: bold;
  }
</style>
