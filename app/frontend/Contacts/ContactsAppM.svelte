<Route path="person/:personID/edit">
  {ensureLoaded(selectedPerson, "/contacts/")}
  <PersonM person={$selectedPerson} />
</Route>
<Route path="search">
  <PersonsM doSearch={true} />
</Route>
<Route path="/">
  <PersonsM />
</Route>

<script lang="ts">
  import { selectedPerson } from "./Person/Selected";
  import PersonsM from "./PersonsM.svelte";
  import PersonM from "./PersonM.svelte";
  import { ensureLoaded } from "../Util/svelte";
  import { Route } from "svelte-navigator";
</script>
