<vbox flex class="message-list"
  on:keydown={event => catchErrors(() => onKeyOnList(event))}
  tabindex={0}
  >
  <FastList items={sortedMessages}
    bind:selectedItem={selectedMessage}
    bind:selectedItems={selectedMessages}
    columns="auto auto auto 1fr 3fr auto auto auto">
    <svelte:fragment slot="header">
      <hbox>{$t`R`}</hbox>
      <hbox>{$t`S`}</hbox>
      <hbox>{$t`A`}</hbox>
      <hbox>{$t`Correspondent`}</hbox>
      <hbox>{$t`Subject`}</hbox>
      <hbox>{$t`Tags`}</hbox>
      <hbox class="date">{$t`Date`}</hbox>
    </svelte:fragment>
    <TableMessageListItem slot="row" let:item message={item} />
  </FastList>
</vbox>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import { onKeyOnList } from "../Message/MessageKeyboard";
  import { EMailCollection } from "../../../logic/Mail/Store/EMailCollection";
  import FastList from "../../Shared/FastList.svelte";
  import TableMessageListItem from "./TableMessageListItem.svelte";
  import type { Collection, ArrayColl } from "svelte-collections";
  import { catchErrors } from "../../Util/error";
  import { t } from "../../../l10n/l10n";

  export let messages: Collection<EMail>;
  export let selectedMessages: ArrayColl<EMail>;
  export let selectedMessage: EMail;

  $: sortedMessages = messages instanceof EMailCollection
    ? messages
    : messages.sortBy(email => -email.sent.getTime());
</script>

<style>
  .message-list :global(.fast-list) {
    padding-block-start: 8px;
    margin-inline-start: -2px;
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
    font-size: 14px;
  }
</style>
