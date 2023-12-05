<vbox flex class="message-list">
  <FastList items={messages} selectedItem={selectedMessage}>
    <svelte:fragment slot="header">
      <hbox>Correspondent</hbox>
      <hbox>Subject</hbox>
      <hbox>Date</hbox>
    </svelte:fragment>
    <svelte:fragment slot="row" let:item={msg}>
      <hbox>{msg.contact.name}</hbox>
      <hbox>{msg.subject}</hbox>
      <hbox>{getDateString(msg.received)}</hbox>
    </svelte:fragment>
  </FastList>
</vbox>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/Message";
  import type { Collection } from "svelte-collections";
  import FastList from "../../Shared/FastList.svelte";
  import { getDateString } from "../../Util/date";

  export let messages: Collection<EMail>;
  export let selectedMessage: EMail;
</script>

<style>
  .message-list :global(.fast-list thead tr hbox) {
    background-color: white;
  }
  .message-list :global(.fast-list tbody tr.selected hbox) {
    background-color: #20AE9E;
    color: white;
  }
  .message-list :global(.fast-list tbody tr:hover) {
    background-color: #A9DAD4;
  }
</style>
