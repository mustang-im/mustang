<Route path="person/:personID/edit">
  {ensureLoaded(selectedPerson, "/contacts/")}
  <PersonM person={$selectedPerson} />
</Route>
<Route path="account/:accountID/persons" let:params>
  <PersonsM selectedAddressbook={appGlobal.addressbooks.find(ab => ab.id == params.accountID)} />
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
  import { appGlobal } from "../../logic/app";
</script>
