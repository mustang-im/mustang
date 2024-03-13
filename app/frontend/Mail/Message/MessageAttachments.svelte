{#if $message.attachments.hasItems}
  <vbox class="attachments">
    <hbox class="attachments-list">
      {#each $message.attachments.each as attachment}
        <MessageAttachment {message} {attachment} />
      {/each}
    </hbox>
  </vbox>
{/if}

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import MessageAttachment from "./MessageAttachment.svelte";

  export let message: EMail;
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
