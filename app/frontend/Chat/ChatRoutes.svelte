{#if appGlobal.isMobile}
  <Route path="person/:personID">
    <ChatM chat={params?.chat ?? $selectedChat ?? requiredParam()} slot="right" />
  </Route>
  <Route path="account/:accountID/persons" let:params={urlParams}>
    {$selectedAccount = params?.chatAccount ?? appGlobal.addressbooks.find(ab => ab.id == urlParams.accountID) ?? requiredParam(), ""}
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
  import { selectedAccount, selectedChat } from "./selected";
  import { appGlobal } from "../../logic/app";
  import ChatAppD from "./ChatAppD.svelte";
  import ChatsM from "./ChatsM.svelte";
  import ChatM from "./ChatM.svelte";
  import { requiredParam } from "../Util/route";
  import { Route, useLocation } from "svelte-navigator";

  $: location = useLocation();
  $: params = $location.state;
</script>
