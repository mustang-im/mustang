<Route path="event">
  <ShowEvent event={params?.event ?? requiredParam()} />
</Route>
<Route path="/">
  <CalendarApp />
</Route>

<script lang="ts">
  import CalendarApp from "./CalendarApp.svelte";
  import ShowEvent from "./DisplayEvent/ShowEvent.svelte";
  import { getParams } from "../AppsBar/selectedApp";
  import { requiredParam } from "../Util/route";
  import { Route, useLocation } from "svelte-navigator";

  $: location = useLocation();
  $: params = getParams($location.state);
</script>
