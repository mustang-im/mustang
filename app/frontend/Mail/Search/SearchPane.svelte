<vbox flex class="search">
  <hbox class="header-bar">
    <hbox class="header top">Search</hbox>
    <hbox flex />
    <hbox class="buttons top-right">
      <RoundButton icon={XIcon} iconSize="16px" padding="4px" border={true} classes="small"
        on:click={onClear} />
    </hbox>
  </hbox>
  <hbox class="term">
    {$t`for`}
    <SearchField bind:searchTerm={$globalSearchTerm}
      placeholder={$t`Mail content or subject`}
      on:clear={onClear} bind:this={searchFieldEl} />
  </hbox>
  <vbox flex class="boolean-criteria">
    <Checkbox bind:checked={isOutgoing}
      label={$t`Sent by me`}>
      <OutgoingIcon size="16px" slot="icon" />
    </Checkbox>
    <Checkbox bind:checked={isUnread}
      label={$t`Unread`}
      classes="unread {isUnread ? "is-unread" : ""}">
      <CircleIcon size="16px" slot="icon" />
    </Checkbox>
    <Checkbox bind:checked={isStar}
      label={$t`Starred`}
      classes="star {isStar ? "starred" : ""}">
      <StarIcon size="16px" slot="icon" />
    </Checkbox>
    <Checkbox bind:checked={isAttachment}
      label={$t`Attachment`}>
      <AttachmentIcon size="16px" slot="icon" />
    </Checkbox>
    {#if isAttachment}
      <vbox flex class="listbox">
        <GenericFileTypesList bind:selectedFileTypes={isAttachmentTypes} />
      </vbox>
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
      -->
    {/if}
    <Checkbox bind:checked={isPerson} allowFalse={false}
      label="{isPerson ? includesPerson?.name ?? $t`Person` : $t`Person`}">
      <PersonIcon size="16px" slot="icon" />
    </Checkbox>
    {#if isPerson}
      <vbox flex class="listbox">
        <PersonsList {persons} bind:selected={includesPerson} size="small" />
      </vbox>
    {/if}
    <Checkbox bind:checked={isAccount} allowFalse={false}
      label={$t`${account?.name} account only`}>
      <AccountIcon size="16px" slot="icon" />
    </Checkbox>
    {#if isAccount || isFolder}
      <vbox class="listbox">
        <AccountList accounts={appGlobal.emailAccounts} bind:selectedAccount={account} />
      </vbox>
    {/if}
    {#if account}
      <Checkbox bind:checked={isFolder} allowFalse={false}
        label={$t`${folder?.name} folder only`}>
        <FolderIcon size="16px" slot="icon" />
      </Checkbox>
      {#if isFolder}
        <vbox flex class="listbox">
          <FolderList folders={account.rootFolders} bind:selectedFolder={folder} bind:selectedFolders />
        </vbox>
      {/if}
    {/if}
  </vbox>
  <hbox class="results-count">
    {#if searchMessages?.length > kLimit}
      {$t`More than ${kLimit} mails`}
    {:else if searchMessages}
      {$t`${searchMessages?.length} mails`}
    {/if}
  </hbox>
  <ExpandSection headerBox={false}>
    <hbox class="header" slot="header">
      {$t`Save search as folder`}
    </hbox>
    <SavedSearchUI {search} on:close={onClear} />
  </ExpandSection>
</vbox>

<script lang="ts">
  import { SQLSearchEMail } from "../../../logic/Mail/SQL/SQLSearchEMail";
  import { globalSearchTerm } from "../../AppsBar/selectedApp";
  import type { EMail } from "../../../logic/Mail/EMail";
  import type { Person } from "../../../logic/Abstract/Person";
  import type { Folder } from "../../../logic/Mail/Folder";
  import type { FileType } from "../../../logic/Files/MIMETypes";
  import { personsInEMails } from "../../../logic/Mail/Person";
  import { selectedMessage, selectedAccount, selectedFolder } from "../Selected";
  import { appGlobal } from "../../../logic/app";
  import SavedSearchUI from "./SavedSearchUI.svelte";
  import SearchField from "../../Shared/SearchField.svelte";
  import GenericFileTypesList from "../../Files/GenericFileTypesList.svelte";
  import PersonsList from "../../Shared/Person/PersonsList.svelte";
  import AccountList from "../LeftPane/AccountList.svelte";
  import FolderList from "../LeftPane/FolderList.svelte";
  import Checkbox from "../../Shared/Checkbox.svelte";
  import ExpandSection from "../../Shared/ExpandSection.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import OutgoingIcon from "lucide-svelte/icons/arrow-big-left";
  import StarIcon from "lucide-svelte/icons/star";
  import CircleIcon from "lucide-svelte/icons/circle";
  import AttachmentIcon from "lucide-svelte/icons/paperclip";
  import AccountIcon from "lucide-svelte/icons/mail";
  import FolderIcon from "lucide-svelte/icons/folder";
  import PersonIcon from "lucide-svelte/icons/user-round";
  import XIcon from "lucide-svelte/icons/x";
  import { showError } from "../../Util/error";
  import type { ArrayColl, Collection } from "svelte-collections";
  import { useDebounce } from '@svelteuidev/composables';
  import { createEventDispatcher, onMount } from 'svelte';
  import { t } from "../../../l10n/l10n";
  const dispatchEvent = createEventDispatcher();

  /** The search result
   * in/out */
  export let searchMessages: ArrayColl<EMail> | null = null;

  let isAccount: boolean | undefined = undefined;
  let isFolder: boolean | undefined = undefined;
  let isOutgoing: boolean | undefined = undefined;
  let isUnread: boolean | undefined = undefined;
  let isStar: boolean | undefined = undefined;
  let isAttachment: boolean | undefined = undefined;
  let isAttachmentTypes: Collection<FileType> | undefined = undefined;
  let isMinSize: boolean | undefined = undefined;
  let isMaxSize: boolean | undefined = undefined;
  let minSizeMB: number | undefined = undefined;
  let maxSizeMB: number | undefined = undefined;
  let isPerson: boolean | undefined = undefined;
  let includesPerson: Person | undefined = undefined;

  $: if (!isMinSize) minSizeMB = undefined;
  $: if (!isMaxSize) maxSizeMB = undefined;

  let account = $selectedAccount;
  let folder = $selectedFolder;
  let selectedFolders: ArrayColl<Folder>;
  $: persons = searchMessages ? personsInEMails(searchMessages) : appGlobal.collectedAddressbook.persons;
  $: if (!isPerson) includesPerson = null;
  let isOpen = true;

  const kLimit = 200;
  let search = new SQLSearchEMail();
  $: isOpen && $globalSearchTerm, isOutgoing, isUnread, isStar, isAttachment, $isAttachmentTypes,
    isMaxSize, isMinSize, maxSizeMB, minSizeMB,
    isAccount, account, isFolder, folder, isPerson, includesPerson,
    startSearchDebounced();
  const startSearchDebounced = useDebounce(() => startSearch(), 300);
  async function startSearch() {
    try {
      let searchTerm = $globalSearchTerm;
      $selectedMessage = null;

      search.bodyText = searchTerm;
      search.isOutgoing = isOutgoing;
      search.isRead = isUnread !== undefined ? !isUnread : undefined;
      search.isStarred = isStar;
      search.hasAttachment = isAttachment;
      search.hasAttachmentMIMETypes = isAttachment && isAttachmentTypes?.hasItems ? isAttachmentTypes.contents.flatMap(type => type.mimeTypes) : undefined;
      search.sizeMax = maxSizeMB;
      search.sizeMin = minSizeMB;
      search.account = isAccount ? account : undefined;
      search.folder = isFolder ? folder : undefined;
      search.includesPerson = isPerson ? includesPerson : undefined;
      let result = await search.startSearch(kLimit + 1);
      if (!isOpen) {
        return;
      }
      searchMessages = result;
      $selectedMessage = searchMessages.first;
    } catch (ex) {
      showError(ex);
    }
  }

  function onClear() {
    isOpen = false;
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
    margin: 8px 0px 12px 24px;
  }
  .header-bar {
    margin-right: 8px;
  }
  .header.top {
    margin-top: 8px;
  }
  .header {
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
    margin-top: 16px;
  }
  .search :global(.star.starred svg) {
    fill: orange;
  }
  .search :global(.unread.is-unread svg) {
    fill: green;
  }
  .listbox {
    margin: 4px 0px 24px 0px;
  }
  /*
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
  */
  .results-count {
    margin: 12px 24px;
    justify-content: end;
  }
</style>
