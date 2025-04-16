<vbox flex class="pane">
  <Header bind:selectedAccount={$selectedAccount} {accounts} />
  <PersonsList {chatRooms} bind:selectedChat={$selectedChat} {doSearch} />
</vbox>
<ChatsBarM />

<script lang="ts">
  import { Person } from "../../logic/Abstract/Person";
  import { selectedAccount, selectedChat } from "./selected";
  import { selectedWorkspace } from "../MainWindow/Selected";
  import { selectedPerson } from "../Contacts/Person/Selected";
  import { appGlobal } from "../../logic/app";
  import Header from "./Header.svelte";
  import PersonsList from "./PersonsList.svelte";
  import ChatsBarM from "./ChatsBarM.svelte";
  import { mergeColls } from "svelte-collections";
  import { onMount } from "svelte";

  export let doSearch = false;

  $: accounts = appGlobal.chatAccounts.filter(acc => acc.workspace == $selectedWorkspace || !$selectedWorkspace);
  $: chatRooms = $selectedAccount ? $selectedAccount.chats : mergeColls(accounts.map(a => a.chats));

  onMount(() => {
    $selectedChat = $selectedPerson && chatRooms.find(chat => chat.contact == $selectedPerson);
  });
  $: if ($selectedChat?.contact instanceof Person) {
    $selectedPerson = $selectedChat.contact;
  }
  $: chatRooms, clearSelectedChat()
  function clearSelectedChat() {
    if (!chatRooms.contains($selectedChat)) {
      $selectedChat = chatRooms.last;
    }
  }
</script>

<style>
  .pane {
    box-shadow: 2px 0px 6px 0px rgba(0, 0, 0, 10%); /* Also on MessageList */
    background-color: var(--leftbar-bg);
    color: var(--leftbar-fg);
  }
</style>
