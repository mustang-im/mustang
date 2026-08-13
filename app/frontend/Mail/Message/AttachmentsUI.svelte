{#if $visible.hasItems}
  <vbox class="attachments">
    <hbox class="attachments-list">
      {#each $visible.each as attachment}
        <MessageAttachment {message} {attachment} />
      {/each}
    </hbox>
  </vbox>
{/if}

<script lang="ts">
  import type { Attachment } from "../../../logic/Abstract/Attachment";
  import type { EMail } from "../../../logic/Mail/EMail";
  import MessageAttachment from "./AttachmentUI.svelte";
  import type { Collection } from "svelte-collections";

  export let attachments: Collection<Attachment>;
  /** Optional. Only for emails, to download the contents on demand. */
  export let message: EMail = null;

  $: visible = attachments.filterObservable(a => !a.hidden);
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
