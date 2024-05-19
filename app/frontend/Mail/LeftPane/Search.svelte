<vbox flex class="search">
  <hbox class="header-bar">
    <hbox class="header">Search</hbox>
    <hbox flex />
    <hbox class="buttons top-right">
      <RoundButton icon={XIcon} iconSize="16px" padding="4px" border={true} classes="small"
        on:click={onClear} />
    </hbox>
  </hbox>
  <hbox class="term">
    for
    <SearchField bind:searchTerm={$globalSearchTerm}
      placeholder="Mail content or subject"
      on:clear={onClear} bind:this={searchFieldEl} />
  </hbox>
  <vbox class="boolean-criteria">
    <Checkbox bind:checked={isOutgoing}
      label="Sent by me">
      <OutgoingIcon size="16px" slot="icon" />
    </Checkbox>
    <Checkbox bind:checked={isUnread}
      label="Unread"
      classes="unread {isUnread ? "is-unread" : ""}">
      <CircleIcon size="16px" slot="icon" />
    </Checkbox>
    <Checkbox bind:checked={isStar}
      label="Starred"
      classes="star {isStar ? "starred" : ""}">
      <StarIcon size="16px" slot="icon" />
    </Checkbox>
    <!--
    <Checkbox bind:checked={isAttachment}
      label="Attachment">
      <AttachmentIcon size="16px" slot="icon" />
    </Checkbox>
    {#if isAttachment}
      <!-- TODO use Slider --
      <grid class="size">
        <Checkbox bind:checked={isMinSize}
          label="At least " />
        <input type="number" bind:value={minSizeMB}
          min={1} max={20} disabled={!isMinSize} />
        MB
        <Checkbox bind:checked={isMaxSize}
          label="Less than " />
        <input type="number" bind:value={maxSizeMB}
          min={1} max={20} maxlength="2" disabled={!isMaxSize} />
        MB
      </grid>
    {/if}
    -->
    {#if $selectedAccount}
      <Checkbox bind:checked={isAccount}
        label="In account {$selectedAccount.name}" />
    {/if}
    {#if $selectedFolder}
      <Checkbox bind:checked={isFolder}
        label="In folder {$selectedFolder.name}" />
    {/if}
  </vbox>
</vbox>

<script lang="ts">
  import { SQLSearchEMail } from "../../../logic/Mail/SQL/SQLSearchEMail";
  import { globalSearchTerm } from "../../AppsBar/selectedApp";
  import type { EMail } from "../../../logic/Mail/EMail";
  import { selectedMessage, selectedAccount, selectedFolder } from "../Selected";
  import Checkbox from "../../Shared/Checkbox.svelte";
  import SearchField from "../../Shared/SearchField.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import OutgoingIcon from "lucide-svelte/icons/arrow-big-left";
  import StarIcon from "lucide-svelte/icons/star";
  import CircleIcon from "lucide-svelte/icons/circle";
  import AttachmentIcon from "lucide-svelte/icons/paperclip";
  import XIcon from "lucide-svelte/icons/x";
  import { showError } from "../../Util/error";
  import type { ArrayColl } from "svelte-collections";
  import { useDebounce } from '@svelteuidev/composables';
  import { createEventDispatcher, onMount } from 'svelte';
  const dispatchEvent = createEventDispatcher();

  /** The search result
   * in/out */
  export let searchMessages: ArrayColl<EMail> | null = null;

  let isAccount = false;
  let isFolder = false;
  let isOutgoing = false;
  let isUnread = false;
  let isStar = false;
  let isAttachment = false;
  let isMinSize = false;
  let isMaxSize = false;
  let minSizeMB: number | null = null;
  let maxSizeMB: number | null = null;

  $: if (!isMinSize) minSizeMB = null;
  $: if (!isMaxSize) maxSizeMB = null;

  $: $globalSearchTerm, isOutgoing, isUnread, isStar, isAttachment,
    isMaxSize, isMinSize, maxSizeMB, minSizeMB, isAccount, isFolder,
    startSearchDebounced();
  const startSearchDebounced = useDebounce(() => startSearch(), 300);
  async function startSearch() {
    try {
      let searchTerm = $globalSearchTerm;
      console.log("start search term", searchTerm);
      if (!searchTerm) {
        searchMessages = null;
        return;
      }
      $selectedMessage = null;

      let search = new SQLSearchEMail();
      search.bodyText = searchTerm;
      search.isOutgoing = isOutgoing ? true : null;
      search.isRead = isUnread ? false : null;
      search.isStarred = isStar ? true : null;
      search.hasAttachment = isAttachment ? true : null;
      search.sizeMax = isMaxSize ? maxSizeMB : null;
      search.sizeMin = isMinSize ? minSizeMB : null;
      search.account = isAccount ? $selectedAccount : null;
      search.folder = isFolder ? $selectedFolder : null;
      searchMessages = await search.startSearch();
      $selectedMessage = searchMessages.first;
    } catch (ex) {
      showError(ex);
    }
  }

  function onClear() {
    $globalSearchTerm = null;
    searchMessages = null;
    dispatchEvent("clear");
  }

  let searchFieldEl: SearchField;
  onMount(() => {
    if (!$globalSearchTerm) {
      searchFieldEl.focus();
    }
  });
</script>

<style>
  .search {
    margin: 8px 8px 16px 24px;
  }
  .header {
    margin-top: 8px;
    font-size: 20px;
    font-weight: bold;
  }
  .buttons.top-right {
    align-items: start;
  }
  .term {
    margin: 8px 0px;
    font-size: 16px;
    align-items: center;
  }
  .term :global(.search) {
    margin: 0px 8px;
  }
  .term :global(input) {
    font-size: 16px;
  }
  .boolean-criteria {
    margin: 16px 0px;
  }
  .search :global(.star.starred svg) {
    fill: orange;
  }
  .search :global(.unread.is-unread svg) {
    fill: green;
  }
  grid.size {
    margin: 4px 0px 8px 32px;
    grid-template-columns: max-content max-content max-content;
  }
  input {
    text-align: center;
    width: unset;
    margin: 0px 8px;
  }
  input[disabled] {
    background-color: unset;
    border-bottom: unset;
  }
</style>
