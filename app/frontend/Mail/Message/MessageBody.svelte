<vbox flex class="message-body">
  {#if message.html}
    <HTMLDisplay html={message.html} />
  {:else}
    <PlaintextDisplay plaintext={message.text} />
  {/if}
</vbox>

<script lang="ts">
  import type { Email } from "mustang-lib";
  import HTMLDisplay from "./HTMLDisplay.svelte";
  import PlaintextDisplay from "./PlaintextDisplay.svelte";

  export let message: Email;
</script>

<style>
  .message-body {
    overflow: auto;
    background-color: white;
    padding: 16px 32px;
    z-index: 0;
  }
</style>
