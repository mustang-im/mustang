<vbox class="message-list">
  <FastList list={messages} selectedItem={selectedMessage}>
    <header slot="header">
      <hbox>From</hbox>
      <hbox>To</hbox>
      <hbox>Subject</hbox>
      <hbox>Date</hbox>
    </header>
    <row rowheight="20" slot="row">
      <hbox field="authorRealname"></hbox>
      <hbox field="to"></hbox>
      <hbox field="subject"></hbox>
      <hbox field="date"></hbox>
    </row>
  </FastList>
</vbox>

<script lang="ts">
  import FastList from "../../Util/FastList.svelte";

  export let messages: Collection<Email>;
  export let selectedMessage: Email; /* in/out */

  // TODO gMessageListE.filldate = getDateString;
</script>

<style>
  .message-list {
    flex: 1 0 0;
    border-left: 1px solid grey;
    border-right: 1px solid grey;
  }
</style>
