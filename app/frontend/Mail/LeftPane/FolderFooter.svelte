<!-- Appears below the msg list -->
 {#if folder}
  <hbox class="folder-header">
    <hbox class="buttons">
      {#if $account?.isLoggedIn}
        <GetMailButton {folder} />
      {/if}
      <hbox class="star button" class:starred={isShowStarred}>
        <Button
          icon={StarIcon}
          iconSize="16px"
          iconOnly
          label={$t`Show only starred messages`}
          onClick={toggleStarred}
          plain
          />
      </hbox>
      <hbox class="unread-dot button" class:unread={isShowUnread}>
        <Button
          icon={CircleIcon}
          iconSize="7px"
          iconOnly
          label={$t`Show only unread messages`}
          onClick={toggleUnread}
          plain
          />
      </hbox>
    </hbox>
    <hbox flex />
    <hbox class="msg-count">
      {#if searchMessages}
        {#if $searchMessages.hasItems}
          {$t`${$searchMessages.length} search results`}
        {:else}
          {$t`No search results`}
        {/if}
      {:else}
        {#if $folder.countTotal > 0}
          {$t`${$folder.countNewArrived} new,
              ${$folder.countUnread} unread,
              ${$folder.countTotal} total`}
        {/if}
        {#if $folder.countTotal > 0 && $folder.countTotal != $messages.length}
          {#if $messages.length == 0}
            {$t`Loading...`}
          {:else}
            {$t`${$messages.length} displayed.`}
          {/if}
        {/if}
      {/if}
    </hbox>
    <hbox flex />
  </hbox>
{/if}

<script lang="ts">
  import type { Folder } from '../../../logic/Mail/Folder';
  import type { EMail } from '../../../logic/Mail/EMail';
  import { newSearchEMail } from '../../../logic/Mail/Store/setStorage';
  import GetMailButton from './GetMailButton.svelte';
  import Button from '../../Shared/Button.svelte';
  import StarIcon from "lucide-svelte/icons/star";
  import CircleIcon from "lucide-svelte/icons/circle";
  import type { ArrayColl } from 'svelte-collections';
  import { t } from '../../../l10n/l10n';

  export let folder: Folder;
  export let searchMessages: ArrayColl<EMail> | null; /** out */

  $: account = folder?.account;
  $: messages = folder?.messages;

  let isShowStarred = false;
  async function toggleStarred() {
    isShowStarred = !isShowStarred;
    await startSearch();
  }

  let isShowUnread = false;
  async function toggleUnread() {
    isShowUnread = !isShowUnread;
    await startSearch();
  }

  async function startSearch() {
    if (!isShowStarred && !isShowUnread) {
      searchMessages = null;
      return;
    }
    let search = newSearchEMail();
    if (isShowStarred) { // undefined != false
      search.isStarred = true;
    }
    if (isShowUnread) {
      search.isRead = false;
    }
    search.folder = folder;
    searchMessages = await search.startSearch();
  }
</script>

<style>
  .folder-header {
    align-items: center;
    justify-content: center;
    height: 20px;
    font-size: 12px;
    padding-block-start: 2px;
    padding-block-end: 2px;
    padding-inline-start: 4px;
    padding-inline-end: 4px;
    overflow: auto;
  }
  .folder-header :global(.get-mail button) {
    height: 20px;
    width: 20px;
    border: none;
  }
  .msg-count {
    padding-inline-start: 4px;
    padding-inline-end: 8px;
  }
  .star.starred :global(svg) {
    fill: orange;
  }
  .unread-dot.unread :global(svg) {
    fill: green;
  }
</style>
