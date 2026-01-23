<vbox flex class="pane">
  <Header bind:selectedAccount={$selectedAccount} {accounts} />
  <RoomList {rooms} bind:selectedRoom={$selectedRoom} {doSearch} />
</vbox>
{#if $appGlobal.isMobile}
  <RoomsBarM />
{/if}

<script lang="ts">
  import { Person } from "../../logic/Abstract/Person";
  import { selectedAccount, selectedRoom } from "./selected";
  import { selectedWorkspace } from "../MainWindow/Selected";
  import { selectedPerson } from "../Contacts/Person/Selected";
  import { appGlobal } from "../../logic/app";
  import Header from "./Header.svelte";
  import RoomList from "./RoomList.svelte";
  import RoomsBarM from "./RoomsBarM.svelte";
  import { mergeColls } from "svelte-collections";
  import { onMount } from "svelte";

  export let doSearch = false;

  $: accounts = appGlobal.chatAccounts.filterObservable(acc => acc.workspace == $selectedWorkspace || !$selectedWorkspace);
  $: rooms = $selectedAccount ? $selectedAccount.rooms : mergeColls(accounts.map(a => a.rooms));

  onMount(() => {
    $selectedRoom = $selectedPerson && rooms.find(room => room.contact == $selectedPerson);
  });
  $: if ($selectedRoom?.contact instanceof Person) {
    $selectedPerson = $selectedRoom.contact;
  }
  $: rooms, clearSelectedRoom()
  function clearSelectedRoom() {
    if (!rooms.contains($selectedRoom)) {
      $selectedRoom = rooms.last;
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
