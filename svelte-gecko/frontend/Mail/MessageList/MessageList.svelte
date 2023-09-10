<vbox flex class="message-list">
  <FastList items={testMessages} selectedItem={selectedMessage}>
    <svelte:fragment slot="header">
      <hbox>From</hbox>
      <hbox>To</hbox>
      <hbox>Subject</hbox>
      <hbox>Date</hbox>
    </svelte:fragment>
    <svelte:fragment slot="row" let:item={msg}>
      <hbox>{msg.authorRealname}</hbox>
      <hbox>{msg.recipientRealname}</hbox>
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
  .message-list {
    border-left: 1px solid grey;
    border-right: 1px solid grey;
  }
</style>
