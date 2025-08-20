{#if appGlobal.isMobile}
  <Route path="person/:personID/edit">
    {ensureLoaded(selectedPerson, "/contacts/")}
    <PersonM person={$selectedPerson} />
  </Route>
  <Route path="account/:accountID/persons" let:params={urlParams}>
    <!--{ensureIDMatch(params.addressbook, urlParams.accountID, id => appGlobal.addressbooks.find(ab => ab.id == id))}-->
    <PersonsM selectedAddressbook={params.addressbook} />
  </Route>
  <Route path="search">
    <PersonsM doSearch={true} />
  </Route>
  <Route path="/">
    <PersonsM />
  </Route>
{:else}
  <Route path="/">
    <ContactsAppD />
  </Route>
{/if}

<script lang="ts">
  import { selectedPerson } from "./Person/Selected";
  import { appGlobal } from "../../logic/app";
  import ContactsAppD from "./ContactsAppD.svelte";
  import PersonsM from "./PersonsM.svelte";
  import PersonM from "./PersonM.svelte";
  import { ensureLoaded } from "../Util/route";
  import { Route, useLocation } from "svelte-navigator";

  $: location = useLocation();
  $: params = $location.state;
</script>
