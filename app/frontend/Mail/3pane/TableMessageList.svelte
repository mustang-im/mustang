<vbox flex class="message-list"
  on:keydown={event => catchErrors(() => onKey(event))}>
  <FastList items={sortedMessages}
    bind:selectedItem={selectedMessage}
    bind:selectedItems={selectedMessages}>
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
  import type { Collection, ArrayColl } from "svelte-collections";
  import FastList from "../../Shared/FastList.svelte";
  import TableMessageListItem from "./TableMessageListItem.svelte";
  import { catchErrors } from "../../Util/error";

  export let messages: Collection<EMail>;
  export let selectedMessages: ArrayColl<EMail>;
  export let selectedMessage: EMail;

  $: sortedMessages = messages.sortBy(email => -email.received.getTime());

  async function onKey(event: KeyboardEvent) {
    if (event.key == "Delete") {
      await Promise.all(selectedMessages.map(msg => msg.deleteMessage()));
      event.stopPropagation();
    } else if (event.key == "j") {
      await Promise.all(selectedMessages.map(msg => msg.deleteMessage()));
      event.stopPropagation();
    }
  }
</script>

<style>
  .message-list :global(.fast-list thead tr hbox) {
    background-color: white;
  }
  .message-list :global(.fast-list table) {
    padding-left: 4px;
  }
</style>
