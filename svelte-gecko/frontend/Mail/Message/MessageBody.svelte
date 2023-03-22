<vbox class="message-body">
  <div class="msg-body-plaintext value">
    {plaintext || ''}
  </div>
  <!-- svelte-ignore a11y-missing-attribute -->
  <iframe class="msg-body-frame">
  </iframe>
</vbox>

<script lang="ts">
  import type { Email } from "mustang-lib";
  import { backgroundError } from "../../Util/error";

  export let message: Email;

  $: showMessage(message);
  let plaintext: string = null;
  async function showMessage(_dummy) {
    plaintext = null;
    plaintext = await message.bodyPlaintext();
    message.markAsRead(true)
      .catch(backgroundError);
  }
</script>

<style>
  .message-body {
    flex: 1 0 0;
    overflow: auto;
  }
  .msg-body-plaintext {
    flex: 1 0 0;
  }
  .msg-body-frame {
    display: none;
  }
</style>
