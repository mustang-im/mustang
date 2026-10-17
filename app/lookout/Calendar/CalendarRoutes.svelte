<Route path="event">
  <EventFormRoute />
</Route>
<Route path="/">
  <CalendarApp />
</Route>

<script lang="ts">
  import CalendarApp from "./CalendarApp.svelte";
  import EventFormRoute from "./EditEvent/EventFormRoute.svelte";
  import { Route } from "svelte-navigator";
</script>
