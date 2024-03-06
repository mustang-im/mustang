<vbox flex class="message-list"
  on:keydown={event => catchErrors(() => onKey(event))}>
  <FastList items={sortedMessages}
    bind:selectedItem={selectedMessage}
    bind:selectedItems={selectedMessages}
    columns="auto">
    <svelte:fragment slot="header">
    </svelte:fragment>
    <VerticalMessageListItem slot="row" let:item message={item} />
  </FastList>
</vbox>

<script lang="ts">
  import type EMail from "../../../../lib/logic/mail/EMail";
  import type { Collection, ArrayColl } from "svelte-collections";
  import FastList from "../../Shared/FastList.svelte";
  import VerticalMessageListItem from "./VerticalMessageListItem.svelte";
  import { catchErrors } from "../../Util/error";

  export let messages: Collection<EMail>;
  export let selectedMessage: EMail;
  export let selectedMessages: ArrayColl<EMail>;

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
  .message-list :global(.fast-list) {
    padding-left: 4px;
    margin-left: -5px;
    padding-right: 9px;
  }
  .message-list :global(.header) {
    display: none;
  }
  .message-list :global(.header hbox) {
    vertical-align: middle;
    border: none;
    color: grey;
    font-size: 12px;
  }
  .message-list :global(.header) {
    height: 32px;
  }
  .message-list :global(.row hbox) {
    font-size: 13px;
  }
</style>
