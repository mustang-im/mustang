<Route path="event">
  <EventFormRoute />
</Route>
<Route path="/">
  <CalendarPage />
</Route>

<script lang="ts">
  import CalendarPage from "./CalendarPage.svelte";
  import EventFormRoute from "./EditEvent/EventFormRoute.svelte";
  import { Route } from "svelte-navigator";
</script>
