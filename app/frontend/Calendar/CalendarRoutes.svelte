<Route path="event">
  <ShowEvent event={params?.event ?? requiredParam()} />
</Route>
<Route path="todos">
  <TODOsM />
</Route>
<Route path="/">
  {params?.event ? $selectedEvent = params.event : null, ""}
  <CalendarApp />
</Route>

<script lang="ts">
  import { selectedEvent } from "./selected";
  import CalendarApp from "./CalendarApp.svelte";
  import ShowEvent from "./DisplayEvent/ShowEvent.svelte";
  import TODOsM from "./TODO/TODOsM.svelte";
  import { getParams } from "../AppsBar/selectedApp";
  import { requiredParam } from "../Util/route";
  import { Route, useLocation } from "svelte-navigator";

  $: location = useLocation();
  $: params = getParams($location.state);
</script>
