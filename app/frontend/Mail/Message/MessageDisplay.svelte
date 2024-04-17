<vbox flex class="message-display">
  <MessageHeader {message} />
  <MessageAttachments {message} />
  <vbox flex class="paper">
    <MessageBody {message} />
  </vbox>
</vbox>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import MessageHeader from "./MessageHeader.svelte";
  import MessageAttachments from "./AttachmentsUI.svelte";
  import MessageBody from "./MessageBody.svelte";

  export let message: EMail;
</script>

<style>
.message-display {
  background-color: #F9F9FD;
}
.paper {
  background-color: white;
  border-radius: 5px;
  box-shadow: -1px 0px 5px 0.5px rgb(0, 0, 0, 10%);
  margin: 0px 0px 2px 8px;
}
</style>
