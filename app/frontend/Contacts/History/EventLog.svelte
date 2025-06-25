<vbox>
  <div class="title">
    {event.title}
  </div>
</vbox>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";

  export let event: Event;
</script>

<style>
  .title {
    font-weight: bold;
  }
</style>
