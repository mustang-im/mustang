{#if appGlobal.isMobile}
  <Route path="chat">
    <ChatM chat={params?.chat ?? $selectedChat} />
  </Route>
  <Route path="person/:personID">
    <ChatM chat={findChatForPerson(params?.person)} />
  </Route>
  <Route path="account/:accountID/persons" let:params={urlParams}>
    {$selectedAccount = params?.chatAccount ?? appGlobal.chatAccounts.find(ab => ab.id == urlParams.accountID) ?? requiredParam(), ""}
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
  import { ChatRoom } from "../../logic/Chat/ChatRoom";
  import { Person } from "../../logic/Abstract/Person";
  import { selectedAccount, selectedChat } from "./selected";
  import { appGlobal } from "../../logic/app";
  import ChatAppD from "./ChatAppD.svelte";
  import ChatsM from "./ChatsM.svelte";
  import ChatM from "./ChatM.svelte";
  import { getParams } from "../AppsBar/selectedApp";
  import { requiredParam } from "../Util/route";
  import { Route, useLocation } from "svelte-navigator";

  $: location = useLocation();
  $: params = getParams($location.state);

  function findChatForPerson(person: Person): ChatRoom | null {
    if (!person) {
      return null;
    }
    for (let account of appGlobal.chatAccounts) {
      for (let chat of account.chats) {
        if (chat.contact == person) { // TODO ChatPerson != Person. chat.contact as PersonUID? Use contact.matchesPerson() ?
          return chat;
        }
      }
    }
    return null;
  }
</script>
