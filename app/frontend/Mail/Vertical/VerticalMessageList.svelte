<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<vbox flex class="message-list"
  on:keydown={event => catchErrors(() => onKeyOnList(event))}
  tabindex={0}
  >
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
  import type { EMail } from "../../../logic/Mail/EMail";
  import { onKeyOnList } from "../Message/MessageKeyboard";
  import { EMailCollection } from "../../../logic/Mail/Store/EMailCollection";
  import FastList from "../../Shared/FastList.svelte";
  import VerticalMessageListItem from "./VerticalMessageListItem.svelte";
  import { catchErrors } from "../../Util/error";
  import type { Collection, ArrayColl } from "svelte-collections";

  export let messages: Collection<EMail>;
  export let selectedMessage: EMail;
  export let selectedMessages: ArrayColl<EMail>;

  $: sortedMessages = messages instanceof EMailCollection
    ? messages
    : messages.sortBy(email => -email.sent.getTime());
</script>

<style>
  .message-list :global(.fast-list) {
    padding-inline-start: 4px;
    margin-inline-start: -5px;
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
    font-size: 14px;
  }
  .message-list :global(.row:nth-child(even):not(.selected):not(:hover) .message) {
    background-color: var(--leftbar-bg);
    color: var(--leftbar-fg);
  }
</style>
