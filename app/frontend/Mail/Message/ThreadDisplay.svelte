<Scroll>
  <vbox class="messages">
    {#each $threadMessages.each as message, i}
      <MailMessage {message} previousMessage={threadMessages.getIndex(i - 1)} />
    {/each}
  </vbox>
</Scroll>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import { SQLSearchEMail } from "../../../logic/Mail/SQL/SQLSearchEMail";
  import MailMessage from "../MailChat/MailMessage.svelte";
  import Scroll from "../../Shared/Scroll.svelte";
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
