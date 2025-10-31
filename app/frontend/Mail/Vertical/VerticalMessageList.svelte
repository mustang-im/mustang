<vbox flex class="message-list"
  on:keydown={event => catchErrors(() => onKeyOnList(event))}
  tabindex={0}
  >
  <FastList items={sortedMessages}
    bind:selectedItem={selectedMessage}
    bind:selectedItems={selectedMessages}
    bind:isAtTop
    columns="auto">
    <svelte:fragment slot="header">
    </svelte:fragment>
    <VerticalMessageListItem slot="row" let:item message={item} on:click />
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
  /** From FastList. out only */
  export let isAtTop: boolean = false;

  $: sortedMessages = messages instanceof EMailCollection
    ? messages
    : messages.sortBy(email => -email.sent.getTime());
</script>

<style>
  .message-list :global(.fast-list) {
    padding-inline-start: 4px;
  }
  .message-list :global(.header) {
    display: none;
  }
  .message-list :global(.header hbox) {
    vertical-align: middle;
    border: none;
    color: grey;
  }
  .message-list :global(.header) {
    height: 32px;
  }
  .message-list :global(.row.odd:not(.selected):not(:hover) .message) {
    background-color: var(--leftbar-bg);
    color: var(--leftbar-fg);
  }
</style>
