<hbox class="msg-count font-smallest">
  {#if searchMessages}
    {#if $searchMessages.hasItems}
      {$t`${$searchMessages.length} of ${$messages.length}`}
    {:else}
      {$t`No search results`}
    {/if}
  {:else}
    {#if $folder.countTotal > 0}
      {#if $messages.length == 0}
        {$t`Loading...`}
      {:else}
        {$t`${$messages.length} mails *=> number of emails in the folder`}
      {/if}
    {:else}
      {$t`Empty folder`}
    {/if}
  {/if}
</hbox>

<script lang="ts">
  import type { Folder } from '../../../logic/Mail/Folder';
  import type { EMail } from '../../../logic/Mail/EMail';
  import { appGlobal } from '../../../logic/app';
  import type { ArrayColl } from 'svelte-collections';
  import { t } from '../../../l10n/l10n';

  export let folder: Folder;
  export let searchMessages: ArrayColl<EMail> | null; /** out */

  $: messages = folder?.messages;
</script>

<style>
  .msg-count {
    align-items: center;
    padding-inline-start: 4px;
    padding-inline-end: 8px;
    opacity: 70%;
  }
</style>
