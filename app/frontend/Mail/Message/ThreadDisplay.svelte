<MessageList messages={threadMessages}>
  <svelte:fragment slot="message" let:message let:previousMessage>
    {#if message instanceof EMail }
      <MailMessage {message} {previousMessage} />
    {/if}
  </svelte:fragment>
</MessageList>

<script lang="ts">
  import { EMail } from "../../../logic/Mail/EMail";
  import { SQLSearchEMail } from "../../../logic/Mail/SQL/SQLSearchEMail";
  import MessageList from "../../Chat/MessageView/MessageList.svelte";
  import MailMessage from "../MailChat/MailMessage.svelte";
  import { ArrayColl } from "svelte-collections";
  import { catchErrors } from "../../Util/error";

  export let message: EMail;

  let threadMessages = new ArrayColl<EMail>();
  $: message && catchErrors(getThread);
  async function getThread() {
    threadMessages.clear();
    threadMessages.add(message);
    message.html;
    if (!message.threadID) {
      return;
    }
    let search = new SQLSearchEMail();
    search.threadID = message.threadID;
    threadMessages.clear();
    threadMessages.addAll(await search.startSearch());
    for (let msg of threadMessages) {
      msg.html;
    }
  }
</script>

<script lang="ts" context="module">
  export enum DisplayMode {
    HTML = "html",
    HTMLWithExternal = "with-external",
    Plaintext = "plaintext",
    Source = "source",
    Thread = "thread",
  }
</script>
