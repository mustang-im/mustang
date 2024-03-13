{#if $message.attachments.hasItems}
  <vbox class="attachments">
    {#each $message.attachments.each as attachment}
      <MessageAttachment {message} {attachment} />
    {/each}
  </vbox>
{/if}

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import MessageAttachment from "./MessageAttachment.svelte";

  export let message: EMail;

  $: console.log("attachmnets", message.attachments);
</script>

<style>
  .attachments {
    flex-wrap: wrap;
  }
</style>
