<Route path="history">
  <CallHistory />
</Route>
<Route path="/">
  <Main />
</Route>

<script lang="ts">
  import Main from "./Main.svelte";
  import CallHistory from "./Start/CallHistory.svelte";
  import { Route } from "svelte-navigator";
</script>
