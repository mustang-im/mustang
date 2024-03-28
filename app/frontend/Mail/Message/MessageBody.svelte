<vbox flex class="message-body">
  {#if message.html}
    <HTMLDisplay html={$message.html} />
  {:else}
    <PlaintextDisplay plaintext={$message.text} />
  {/if}
</vbox>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import HTMLDisplay from "./HTMLDisplay.svelte";
  import PlaintextDisplay from "./PlaintextDisplay.svelte";

  export let message: EMail;
</script>
