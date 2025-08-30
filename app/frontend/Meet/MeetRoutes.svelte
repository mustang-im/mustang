<Route path="history">
  <CallHistory />
</Route>
<Route path="call">
  <Calling meeting={params.meeting ?? requiredParam()} />
</Route>
<Route path="/">
  <!-- param is optional -->
  <Main meetingFromRoute={params?.meeting} />
</Route>

<script lang="ts">
  import Main from "./Main.svelte";
  import CallHistory from "./Start/CallHistory.svelte";
  import { getParams } from "../AppsBar/selectedApp";
  import { requiredParam } from "../Util/route";
  import { Route, useLocation } from "svelte-navigator";
  import Calling from "./Start/Calling.svelte";

  $: location = useLocation();
  $: params = getParams($location.state);
</script>
