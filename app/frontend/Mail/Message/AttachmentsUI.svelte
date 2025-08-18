{#if attachments.hasItems}
  <vbox class="attachments">
    <hbox class="attachments-list">
      {#each attachments.each as attachment}
        <MessageAttachment {message} {attachment} />
      {/each}
    </hbox>
  </vbox>
{/if}

<script lang="ts">
  import { ContentDisposition } from "../../../logic/Abstract/Attachment";
  import type { EMail } from "../../../logic/Mail/EMail";
  import MessageAttachment from "./AttachmentUI.svelte";

  export let message: EMail;

  $: attachments = $message.attachments.filterObservable(a =>
        a.disposition == ContentDisposition.attachment && !a.hidden);
</script>

<style>
  .attachments {
    min-height: 64px;
    max-height: 120px;
    position: relative;
  }
  .attachments-list {
    flex-wrap: wrap;
    padding: 4px;
    overflow-y: auto;
  }
</style>
