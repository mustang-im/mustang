<vbox flex class="message-list">
  <FastList items={sortedMessages} bind:selectedItem={selectedMessage}>
    <svelte:fragment slot="header">
      <hbox></hbox>
      <hbox></hbox>
      <hbox>Correspondent</hbox>
      <hbox>Subject</hbox>
      <hbox>Date</hbox>
    </svelte:fragment>
    <TableMessageListItem slot="row" let:item message={item} />
  </FastList>
</vbox>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/Message";
  import type { Collection } from "svelte-collections";
  import FastList from "../../Shared/FastList.svelte";
  import TableMessageListItem from "./TableMessageListItem.svelte";

  export let messages: Collection<EMail>;
  export let selectedMessage: EMail;

  $: sortedMessages = messages.sortBy(email => -email.received.getTime());
</script>

<style>
  .message-list :global(.fast-list thead tr hbox) {
    background-color: white;
  }
  .message-list :global(.fast-list table) {
    padding-left: 4px;
  }
</style>
