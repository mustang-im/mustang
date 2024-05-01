<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<vbox flex class="message-list"
  on:keydown={event => catchErrors(() => onKeyOnList(event))}
  tabindex={0}
  >
  <FastList items={sortedMessages}
    bind:selectedItem={selectedMessage}
    bind:selectedItems={selectedMessages}
    columns="auto auto auto auto 1fr 3fr auto">
    <svelte:fragment slot="header">
      <hbox>R</hbox>
      <hbox>S</hbox>
      <hbox>A</hbox>
      <hbox>Correspondent</hbox>
      <hbox>Subject</hbox>
      <hbox class="date">Date</hbox>
    </svelte:fragment>
    <TableMessageListItem slot="row" let:item message={item} />
  </FastList>
</vbox>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import { onKeyOnList } from "./MessageList";
  import FastList from "../../Shared/FastList.svelte";
  import TableMessageListItem from "./TableMessageListItem.svelte";
  import type { Collection, ArrayColl } from "svelte-collections";
  import { catchErrors } from "../../Util/error";

  export let messages: Collection<EMail>;
  export let selectedMessages: ArrayColl<EMail>;
  export let selectedMessage: EMail;

  $: sortedMessages = messages.sortBy(email => -email.sent.getTime());
</script>

<style>
  .message-list :global(.fast-list) {
    padding-top: 8px;
    margin-left: -2px;
  }
  .message-list :global(.header) {
    display: none;
  }
  .date {
    justify-content: center;
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
