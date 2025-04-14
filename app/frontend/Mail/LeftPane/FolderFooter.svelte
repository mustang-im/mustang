<!-- Appears below the msg list -->
 {#if folder}
  <hbox class="folder-header">
    {#if $account?.isLoggedIn}
      <GetMailButton {folder} />
    {/if}
    <hbox class="buttons">
      <hbox class="star button" class:starred={isShowStarred}>
        <RoundButton
          icon={StarIcon}
          iconSize="16px"
          border={false}
          label={$t`Show only starred messages`}
          onClick={toggleStarred}
          />
      </hbox>
      <hbox class="unread-dot button" class:unread={isShowUnread}>
        <RoundButton
          icon={CircleIcon}
          iconSize="7px"
          border={false}
          label={$t`Show only unread messages`}
          onClick={toggleUnread}
          />
      </hbox>
      {#if !isShowSearchField}
        <hbox class="show-search button">
          <RoundButton
            icon={SearchIcon}
            iconSize="16px"
            border={false}
            label={$t`Search only the currently displayed folder for a keyword`}
            onClick={toggleShowSearchField}
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
    {:else}
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
            {#if $messages.length == 0}
              {$t`Loading...`}
            {:else}
              {$t`${$folder.countUnread} unread *=> number of messages that have not been read yet`},
              {$t`${$messages.length} shown *=> number of messages displayed`}
            {/if}
          {:else}
            {$t`Empty folder`}
          {/if}
        {/if}
      </hbox>
    {/if}
    <hbox flex />
  </hbox>
{/if}

<script lang="ts">
  import type { Folder } from '../../../logic/Mail/Folder';
  import type { EMail } from '../../../logic/Mail/EMail';
  import { newSearchEMail } from '../../../logic/Mail/Store/setStorage';
  import SearchField from '../../Shared/SearchField.svelte';
  import GetMailButton from './GetMailButton.svelte';
  import RoundButton from '../../Shared/RoundButton.svelte';
  import SearchIcon from "lucide-svelte/icons/search";
  import StarIcon from "lucide-svelte/icons/star";
  import CircleIcon from "lucide-svelte/icons/circle";
  import { catchErrors } from '../../Util/error';
  import type { ArrayColl } from 'svelte-collections';
  import { t } from '../../../l10n/l10n';

  export let folder: Folder;
  export let searchMessages: ArrayColl<EMail> | null; /** out */

  $: account = folder?.account;
  $: messages = folder?.messages;

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

  /** Filters the folder.messages array */
  async function startSearch() {
    if (!isShowStarred && !isShowUnread && !searchTerm) {
      searchMessages = null;
      return;
    }
    searchMessages = await folder.messages.filter(msg =>
      (!isShowStarred || msg.isStarred === true) &&
      (!isShowUnread || msg.isRead === false) &&
      (!searchTerm || searchTerm.length > 1) &&
      (!searchTerm ||
        msg.subject?.toLowerCase().includes(searchTerm) ||
        msg.from?.name?.toLowerCase().includes(searchTerm) ||
        msg.from?.emailAddress?.toLowerCase().includes(searchTerm) ||
        msg.to?.some(to => to.name?.toLowerCase().includes(searchTerm) ||
          to.emailAddress?.toLowerCase().includes(searchTerm)) ||
        msg.text?.toLowerCase().includes(searchTerm))
    );
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
    height: 20px;
    font-size: 12px;
    padding-block-start: 2px;
    padding-block-end: 2px;
    padding-inline-start: 4px;
    padding-inline-end: 4px;
    color: var(--leftbar-fg);
    background-color: var(--leftbar-bg);
    overflow: auto;
  }
  .folder-header :global(.get-mail button) {
    height: 20px;
    width: 20px;
    border: none;
  }
  .folder-header :global(.search) {
    height: 18px;
    margin-inline-start: 8px;
  }
  .folder-header :global(input[type="search"]) {
    height: 18px;
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
