<!-- Appears below the msg list -->
 {#if folder}
  <hbox class="folder-header font-smallest">
    {#if showGetMail && $account?.isLoggedIn}
      <GetMailButton {folder} />
    {/if}
    <hbox class="buttons">
      <hbox class="attachment button" class:on={isShowAttachments}>
        <RoundButton
          icon={AttachmentIcon}
          iconSize={$appGlobal.isMobile ? "20px" : "14px"}
          label={$t`Show only messages with attachments`}
          onClick={toggleAttachments}
          selected={isShowAttachments}
          border={false}
          />
      </hbox>
      <hbox class="star button" class:starred={isShowStarred}>
        <RoundButton
          icon={StarIcon}
          iconSize={$appGlobal.isMobile ? "24px" : "16px"}
          label={$t`Show only starred messages`}
          onClick={toggleStarred}
          border={false}
          />
      </hbox>
      <hbox class="unread-dot button" class:unread={isShowUnread}>
        <RoundButton
          icon={CircleIcon}
          iconSize={$appGlobal.isMobile ? "18px" : "10px"}
          padding={$appGlobal.isMobile ? "11px" : "8px"}
          label={$t`Show only unread messages`}
          onClick={toggleUnread}
          border={false}
          />
      </hbox>
      {#if !isShowSearchField}
        <hbox class="show-search button">
        <RoundButton
            icon={SearchIcon}
            iconSize={$appGlobal.isMobile ? "24px" : "16px"}
            label={$t`Search only the currently displayed folder for a keyword`}
            onClick={toggleShowSearchField}
            border={false}
            />
        </hbox>
      {/if}
    </hbox>
    {#if isShowSearchField}
      <SearchField bind:searchTerm
        on:input={() => catchErrors(onSearchTermChanged)}
        on:clear={toggleShowSearchField}
        placeholder={$t`Search only this folder`}
        showX={true}
        autofocus={true} />
      <hbox flex />
      {#if searchMessages && $searchMessages?.hasItems}
        <hbox class="msg-count">
          {$searchMessages.length}
        </hbox>
      {/if}
      <hbox flex />
    {:else if !appGlobal.isMobile}
      <hbox flex />
      <FolderMsgCount {folder} {searchMessages} />
    {/if}
    <hbox flex />
  </hbox>
{/if}

<script lang="ts">
  import type { Folder } from '../../../logic/Mail/Folder';
  import type { EMail } from '../../../logic/Mail/EMail';
  import { newSearchEMail } from '../../../logic/Mail/Store/setStorage';
  import { appGlobal } from '../../../logic/app';
  import FolderMsgCount from './FolderMsgCount.svelte';
  import SearchField from '../../Shared/SearchField.svelte';
  import GetMailButton from './GetMailButton.svelte';
  import RoundButton from '../../Shared/RoundButton.svelte';
  import SearchIcon from "lucide-svelte/icons/search";
  import StarIcon from "lucide-svelte/icons/star";
  import CircleIcon from "lucide-svelte/icons/circle";
  import AttachmentIcon from "lucide-svelte/icons/paperclip";
  import { catchErrors } from '../../Util/error';
  import type { ArrayColl } from 'svelte-collections';
  import { t } from '../../../l10n/l10n';

  export let folder: Folder;
  export let searchMessages: ArrayColl<EMail> | null; /** out */
  export let showGetMail = true;

  $: account = folder?.account;

  $: folder && catchErrors(startSearch);

  let searchTerm: string;
  async function onSearchTermChanged() {
    await startSearch();
  }

  let isShowSearchField = false;
  async function toggleShowSearchField() {
    isShowSearchField = !isShowSearchField;
    if (!isShowSearchField) {
      clearSearch();
    }
  }

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

  let isShowAttachments = false;
  async function toggleAttachments() {
    isShowAttachments = !isShowAttachments;
    await startSearch();
  }

  /** Filters the folder.messages array */
  async function startSearch() {
    if (!isShowStarred && !isShowUnread && !isShowAttachments && !searchTerm) {
      searchMessages = null;
      return;
    }
    searchMessages = folder.messages.filterOnce(msg =>
      (!isShowStarred || msg.isStarred === true) &&
      (!isShowUnread || msg.isRead === false) &&
      (!isShowAttachments || msg.hasVisibleAttachments === true) &&
      (!searchTerm || searchTerm.length > 1) &&
      (!searchTerm ||
        msg.subject?.toLowerCase().includes(searchTerm) ||
        msg.contact?.name?.toLowerCase().includes(searchTerm) ||
        msg.from?.name?.toLowerCase().includes(searchTerm) ||
        msg.from?.emailAddress?.toLowerCase().includes(searchTerm) ||
        msg.to?.some(to => to.name?.toLowerCase().includes(searchTerm) ||
          to.emailAddress?.toLowerCase().includes(searchTerm)) ||
        msg.text?.toLowerCase().includes(searchTerm))
    ) as ArrayColl<EMail>;
  }

  /** Uses the DB to make a global search */
  async function startSearchGlobal() {
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

  function clearSearch() {
    searchTerm = undefined;
    isShowSearchField = false;
    isShowStarred = false;
    isShowUnread = false;
    searchMessages = null;
  }
</script>

<style>
  .folder-header {
    align-items: center;
    justify-content: center;
    max-height: 20px;
    padding-block-start: 2px;
    padding-block-end: 2px;
    padding-inline-start: 4px;
    padding-inline-end: 4px;
    overflow: hidden;
  }
  :global(.mobile) .folder-header {
    height: 32px;
    max-height: 32px;
    font-size: 16px;
  }
  .folder-header :global(button) {
    background-color: unset;
    color: unset;
    margin-inline-end: 4px;
  }
  .folder-header :global(button:hover) {
    z-index: 1;
  }
  .folder-header :global(.get-mail button) {
    height: 20px;
    width: 20px;
    border: none;
    margin-inline-end: 8px;
  }
  :global(.mobile) .folder-header :global(.get-mail button) {
    height: 32px;
    width: 32px;
  }
  .folder-header :global(.star button svg) {
    stroke-width: 1.5px;
  }
  .folder-header :global(.search) {
    height: 18px;
    margin-inline-start: 8px;
  }
  .folder-header :global(input[type="search"]) {
    height: 18px;
  }
  :global(.mobile) .folder-header :global(.search),
  :global(.mobile) .folder-header :global(input[type="search"]) {
    height: 32px;
    font-size: 16px;
  }
  .msg-count {
    align-items: center;
    padding-inline-start: 4px;
    padding-inline-end: 8px;
    opacity: 70%;
  }
  .attachment:not(.on) {
    opacity: 80%;
  }
  .star.starred :global(svg) {
    fill: orange;
  }
  .unread-dot.button {
    margin-inline: -4px;
  }
  .unread-dot.unread :global(svg) {
    fill: green;
  }
</style>
