<hbox class="event">
  {event.startTime.toLocaleTimeString(undefined, { hour: "numeric", minute: "numeric" })}
  {event.title}
</hbox>

<script lang="ts">
  import type { Event } from "../../logic/Calendar/Event";

  export let event: Event;
</script>

<style>
  .event {
    background-color: yellow;
    border-bottom: 1px solid rgba(0, 0, 0, 15%);
    /*box-shadow: 1px 1px 4px 0px grey;*/
    padding: 4px;
  }
</style>
