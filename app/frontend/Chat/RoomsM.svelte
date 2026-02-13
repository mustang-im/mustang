<vbox flex class="pane">
  <Header bind:selectedAccount={$selectedAccount} {accounts} />
  <RoomList {rooms} bind:selectedRoom {doSearch} />
</vbox>
{#if $appGlobal.isMobile}
  <RoomsBarM />
{/if}

<script lang="ts">
  import { ChatRoom } from "../../logic/Chat/ChatRoom";
  import { openChatRoomFromOtherApp } from "./open";
  import { selectedAccount } from "./selected";
  import { selectedWorkspace } from "../MainWindow/Selected";
  import { appGlobal } from "../../logic/app";
  import Header from "./Header.svelte";
  import RoomList from "./RoomList.svelte";
  import RoomsBarM from "./RoomsBarM.svelte";
  import { mergeColls } from "svelte-collections";

  export let doSearch = false;

  $: accounts = appGlobal.chatAccounts.filterObservable(acc => acc.workspace == $selectedWorkspace || !$selectedWorkspace);
  $: rooms = $selectedAccount ? $selectedAccount.rooms : mergeColls(accounts.map(a => a.rooms));

  let selectedRoom: ChatRoom;

  $: selectedRoom && openChatRoomFromOtherApp(selectedRoom);
</script>

<style>
  .pane {
    box-shadow: 2px 0px 6px 0px rgba(0, 0, 0, 10%); /* Also on MessageList */
    background-color: var(--leftbar-bg);
    color: var(--leftbar-fg);
  }
</style>
