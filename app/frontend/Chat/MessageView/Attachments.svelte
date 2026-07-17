{#if $attachments.hasItems}
  <vbox class="attachments">
    {#each $attachments.each as attachment (attachment)}
      <Attachment {attachment} />
    {/each}
  </vbox>
{/if}

<script lang="ts">
  import type { Message } from "../../../logic/Abstract/Message";
  import Attachment from "./Attachment.svelte";

  export let message: Message;

  $: attachments = message.attachments.filterObservable(a => !a.hidden);
</script>

<style>
  .attachments {
    gap: 6px;
    margin-block-start: 6px;
    margin-block-end: 12px;
  }
</style>
