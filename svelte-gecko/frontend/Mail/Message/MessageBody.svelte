<vbox flex class="message-body">
  {#if message.html}
    <div class="msg-body-html value">
      <!-- TODO Sanitize HTML. It comes from untrusted sources. Dangerous! @see also Chat Message.svelte -->
      {@html message.html}
      <!--
      <iframe class="msg-body-frame">
      </iframe>
      -->
    </div>
  {:else}
    <div class="msg-body-plaintext value">
      {message.text || ''}
    </div>
  {/if}
</vbox>

<script lang="ts">
  import type { Email } from "mustang-lib";
  import { backgroundError } from "../../Util/error";

  export let message: Email;

  /*
  $: showMessage(message);
  let plaintext: string = null;
  async function showMessage(_dummy) {
    plaintext = null;
    plaintext = await message.bodyPlaintext();
    message.markAsRead(true)
      .catch(backgroundError);
  }
  */
</script>

<style>
  .message-body {
    overflow: auto;
    background-color: white;
    padding: 16px 32px;
  }
  .msg-body-plaintext {
    flex: 1 0 0;
    white-space: pre-wrap;
    max-width: 50em;
  }
  .msg-body-frame {
    display: none;
  }
</style>
