<vbox flex class="message-list">
  <FastList items={testMessages} selectedItem={selectedMessage}>
    <svelte:fragment slot="header">
      <hbox>Correspondent</hbox>
      <hbox>Subject</hbox>
      <hbox>Date</hbox>
    </svelte:fragment>
    <svelte:fragment slot="row" let:item={msg}>
      <hbox>{msg.outgoing ? msg.recipientRealname : msg.authorRealname}</hbox>
      <hbox>{msg.subject}</hbox>
      <hbox>{getDateString(msg.date)}</hbox>
    </svelte:fragment>
  </FastList>
</vbox>

<script lang="ts">
  //import type { EMail } from "mustang-lib";
  import { Collection, ArrayColl } from 'svelte-collections';
  import FastList from "../../Shared/FastList.svelte";
  import { getDateString } from "../../Util/date";

  class EMail {
    msgID: string;
    date: Date;
    subject: string;
    outgoing: boolean;
    authorRealname: string;
    authorEmailAddress: string;
    recipientEmailAddress: string;
    recipientRealname: string;
    contentType: string;
    _bodyPlaintext: string;
  }

  export let messages: Collection<EMail>;
  export let selectedMessage: EMail; /* in/out */

  let testMessages: Collection<EMail> = new ArrayColl<EMail>();
  for (let i = 1; i < 10000; i++) {
    let msg = new EMail();
    msg.msgID = i + '';
    msg.date = new Date();
    msg.subject = "Talk about " + i;
    msg.outgoing = Math.random() > 0.5;
    msg.authorRealname = "Some guy " + i;
    msg.authorEmailAddress = "guy" + i + "@example.com";
    msg.recipientEmailAddress = "me@example.org";
    msg.recipientRealname = "Ben";
    msg.contentType = "text/plain";
    msg._bodyPlaintext = "Some message " + i;
    testMessages.add(msg);
  }
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
