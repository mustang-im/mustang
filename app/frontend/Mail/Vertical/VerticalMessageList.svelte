<vbox flex class="message-list">
  <FastList items={sortedMessages} bind:selectedItem={selectedMessage}>
    <svelte:fragment slot="header">
    </svelte:fragment>
    <VerticalMessageListItem slot="row" let:item message={item} />
  </FastList>
</vbox>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/Message";
  import type { Collection } from "svelte-collections";
  import FastList from "../../Shared/FastList.svelte";
  import VerticalMessageListItem from "./VerticalMessageListItem.svelte";

  export let messages: Collection<EMail>;
  export let selectedMessage: EMail;

  $: sortedMessages = messages.sortBy(email => -email.received.getTime());
</script>

<style>
  .message-list :global(.fast-list) {
    margin-top: 8px;
    padding-left: 4px;
  }
  .message-list :global(.fast-list thead) {
    display: none;
  }
</style>
