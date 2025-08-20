<Route path="/event">
  <ShowEvent event={params.event} />
</Route>
<Route path="/">
  <CalendarApp />
</Route>

<script lang="ts">
  import CalendarApp from "./CalendarApp.svelte";
  import ShowEvent from "./DisplayEvent/ShowEvent.svelte";
  import { Route, useLocation } from "svelte-navigator";

  $: location = useLocation();
  $: params = $location.state;
</script>
