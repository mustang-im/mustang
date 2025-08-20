{#if appGlobal.isMobile}
  <Route path="person/:personID">
    {ensureLoaded(selectedPerson, "/chat/")}
    <ChatM chat={$selectedChat} slot="right" />
  </Route>
  <Route path="account/:accountID/persons" let:params={urlParams}>
    <!--{ensureIDMatch(params.addressbook, urlParams.accountID, id => appGlobal.addressbooks.find(ab => ab.id == id))}-->
    {$selectedAccount = params.chatAccount ?? appGlobal.addressbooks.find(ab => ab.id == urlParams.accountID), ""}
    <ChatsM />
  </Route>
  <Route path="search">
    <ChatsM doSearch={true} />
  </Route>
  <Route path="/">
    <ChatsM />
  </Route>
{:else}
  <Route path="/">
    <ChatAppD />
  </Route>
{/if}

<script lang="ts">
  import { selectedPerson } from "../Contacts/Person/Selected";
  import { selectedAccount, selectedChat } from "./selected";
  import { appGlobal } from "../../logic/app";
  import ChatAppD from "./ChatAppD.svelte";
  import ChatsM from "./ChatsM.svelte";
  import { ensureLoaded } from "../Util/route";
  import ChatM from "./ChatM.svelte";
  import { Route, useLocation } from "svelte-navigator";

  $: location = useLocation();
  $: params = $location.state;
</script>
