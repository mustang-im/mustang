<Route path="/">
  {params?.category ? $selectedCategory = params.category : null, "" }
  <SettingsApp />
</Route>

<script lang="ts">
  import { selectedCategory } from "./Window/selected";
  import SettingsApp from "./Window/SettingsApp.svelte";
  import { getParams } from "../AppsBar/selectedApp";
  import { Route, useLocation } from "svelte-navigator";

  $: location = useLocation();
  $: params = getParams($location.state);
</script>
