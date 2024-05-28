<Scroll>
  <vbox class="messages">
    {#each $threadMessages.each as message, i}
      <MailMessage {message} previousMessage={threadMessages.getIndex(i - 1)} />
    {/each}
  </vbox>
  <vbox class="rest" flex />
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
    await message.findThread(message.folder.messages);
    if (!message.threadID) {
      return;
    }
    let search = new SQLSearchEMail();
    search.threadID = message.threadID;
    threadMessages.clear();
    let msgs = await search.startSearch();
    msgs = msgs.sortBy(email => email.sent);
    threadMessages.addAll(msgs);
    for (let msg of threadMessages) {
      msg.html;
    }
  }
</script>

<style>
  .messages,
  .rest {
    background: url(../../asset/background-repeat.png) repeat;
    background-color: var(--main-pattern-bg);
    background-blend-mode: soft-light;
    color: var(--main-pattern-fg);
  }
  @media (prefers-color-scheme: light) {
    .messages,
    .rest {
      background-color: #F0F0F5;
      color: black;
    }
    .messages :global(.from) {
      color: black;
      font-size: 16px;
    }
  }
</style>
