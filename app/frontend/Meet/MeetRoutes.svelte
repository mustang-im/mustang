<Route path="history">
  <CallHistory />
</Route>
<Route path="/">
  <!-- param is optional -->
  <Main meetingFromRoute={params?.meeting} />
</Route>

<script lang="ts">
  import Main from "./Main.svelte";
  import CallHistory from "./Start/CallHistory.svelte";
  import { Route, useLocation } from "svelte-navigator";

  $: location = useLocation();
  $: params = $location.state;
</script>
