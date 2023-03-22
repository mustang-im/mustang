<vbox class="message-list">
  <FastList list={messages} selectedItem={selectedMessage}>
    <header slot="header">
      <th>From</th>
      <th>To</th>
      <th>Subject</th>
      <th>Date</th>
    </header>
    <row rowheight="20" slot="row">
      <hbox field="authorRealname"></hbox>
      <hbox field="to"></hbox>
      <hbox field="subject"></hbox>
      <hbox field="date" fillFunc={getDateString}></hbox>
    </row>
  </FastList>
</vbox>

<script lang="ts">
  import type { EMail } from "mustang-lib";
  import { Collection, ArrayColl } from 'jscollections';
  import FastList from "../../Shared/FastList.svelte";
  import { getDateString } from "../../Util/date";

  export let messages: Collection<EMail>;
  export let selectedMessage: EMail; /* in/out */

  /*
  import EMail from "../../../../lib/logic/mail/EMail";
  messages = new ArrayColl<EMail>();
  for (let i = 1; i < 10; i++) {
    let msg = new EMail();
    msg.msgID = i;
    msg.subject = "Talk about " + i;
    msg.authorRealname = "Some guy " + i;
    msg.authorEmailAddress = "guy" + i + "@example.com";
    msg.recipientEmailAddress = "me@example.org";
    msg.recipientRealname = "Ben";
    msg.contentType = "text/plain";
    msg._bodyPlaintext = "Some message " + i;
    messages.add(msg);
  }
  */
</script>

<style>
  .message-list {
    flex: 1 0 0;
    border-left: 1px solid grey;
    border-right: 1px solid grey;
  }
</style>
