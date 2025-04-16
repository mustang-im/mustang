<Route path="person/:personID/edit">
  {ensureLoaded(selectedPerson, "/mail/")}
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
  import { ensureLoaded } from "../Util/svelte";
  import { Route } from "svelte-navigator";
  import PersonM from "./PersonM.svelte";
  import PersonsM from "./PersonsM.svelte";
</script>
