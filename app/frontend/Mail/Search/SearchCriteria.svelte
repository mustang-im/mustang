<vbox flex class="search-criteria">
  {#if showSearchTerm}
    <hbox class="term">
      {$t`Search for`}
      <SearchField bind:searchTerm={search.bodyText}
        placeholder={$t`Mail content or subject`} />
    </hbox>
  {/if}
  <Checkbox bind:checked={search.isOutgoing} allowIndetermined={true}
    label={$t`Sent by me`}>
    <OutgoingIcon size="16px" slot="icon" />
  </Checkbox>
  <Checkbox bind:checked={isUnread} allowIndetermined={true}
    label={isUnread === false ? $t`read` : $t`Unread`}
    classes="unread {isUnread ? "is-unread" : ""}">
    <CircleIcon size="16px" slot="icon" />
  </Checkbox>
  <Checkbox bind:checked={search.isStarred} allowIndetermined={true}
    label={$t`Starred`}
    classes="star {search.isStarred ? "starred" : ""}">
    <StarIcon size="16px" slot="icon" />
  </Checkbox>
  <Checkbox bind:checked={hasAttachment} allowIndetermined={true}
    label={$t`Attachment`}>
    <AttachmentIcon size="16px" slot="icon" />
  </Checkbox>
  {#if hasAttachment}
    <vbox flex class="listbox">
      <GenericFileTypesList bind:selectedMIMETypes={search.hasAttachmentMIMETypes} />
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
  <Checkbox bind:checked={hasPerson} allowFalse={false} allowIndetermined={true}
    label="{hasPerson ? search.includesPerson?.name ?? $t`Person` : $t`Person`}">
    <PersonIcon size="16px" slot="icon" />
  </Checkbox>
  {#if hasPerson}
    <vbox flex class="listbox">
      <PersonsList persons={availablePersons} bind:selected={search.includesPerson} size="small" />
    </vbox>
  {/if}
  <Checkbox bind:checked={hasTag} allowFalse={false} allowIndetermined={true}
    label={$t`Tags`}>
    <TagIcon size="16px" slot="icon" />
  </Checkbox>
  {#if hasTag}
    <vbox class="tags">
      <TagSelector tags={availableTags} selectedTags={search.tags} canAdd={false} />
    </vbox>
  {/if}
  {#if appGlobal.emailAccounts.length > 1}
    <Checkbox bind:checked={hasAccount} allowFalse={false} allowIndetermined={true}
      label={$t`${account?.name} account only`}>
      <AccountIcon size="16px" slot="icon" />
    </Checkbox>
    {#if hasAccount || hasFolder}
      <vbox class="listbox">
        <AccountList accounts={appGlobal.emailAccounts} bind:selectedAccount={account} />
      </vbox>
    {/if}
  {/if}
  {#if account}
    <Checkbox bind:checked={hasFolder} allowFalse={false} allowIndetermined={true}
      label={$t`${folder?.name} folder only`}>
      <FolderIcon size="16px" slot="icon" />
    </Checkbox>
    {#if hasFolder}
      <vbox flex class="listbox">
        <FolderList folders={account.rootFolders} bind:selectedFolder={folder} bind:selectedFolders />
      </vbox>
    {/if}
  {/if}
</vbox>

<script lang="ts">
  import { SearchEMail } from "../../../logic/Mail/Store/SearchEMail";
  import { availableTags } from "../../../logic/Mail/Tag";
  import { personsInEMails } from "../../../logic/Mail/Person";
  import { Folder } from "../../../logic/Mail/Folder";
  import { EMail } from "../../../logic/Mail/EMail";
  import { selectedAccount, selectedFolder } from "../Selected";
  import { appGlobal } from "../../../logic/app";
  import SearchField from "../../Shared/SearchField.svelte";
  import GenericFileTypesList from "../../Files/GenericFileTypesList.svelte";
  import PersonsList from "../../Shared/Person/PersonsList.svelte";
  import AccountList from "../LeftPane/AccountList.svelte";
  import FolderList from "../LeftPane/FolderList.svelte";
  import TagSelector from "../Tag/TagSelector.svelte";
  import Checkbox from "../../Shared/Checkbox.svelte";
  import OutgoingIcon from "lucide-svelte/icons/arrow-big-left";
  import StarIcon from "lucide-svelte/icons/star";
  import CircleIcon from "lucide-svelte/icons/circle";
  import AttachmentIcon from "lucide-svelte/icons/paperclip";
  import AccountIcon from "lucide-svelte/icons/mail";
  import FolderIcon from "lucide-svelte/icons/folder";
  import TagIcon from "lucide-svelte/icons/tag";
  import PersonIcon from "lucide-svelte/icons/user-round";
  import { ArrayColl, Collection } from "svelte-collections";
  import { onMount } from "svelte";
  import { t } from "../../../l10n/l10n";

  /** The search criteria
   * in/out */
  export let search: SearchEMail;

  export let showSearchTerm = true;
  export let searchMessages: Collection<EMail> = null;

  // enable/disable fine-grained controls
  let hasAccount: boolean | null = null;
  let hasFolder: boolean | null = null;
  let hasTag: boolean | null = null;
  let hasSizeMin: boolean | null = null;
  let hasSizeMax: boolean | null = null;
  let hasPerson: boolean | null = null;
  let hasAttachment: boolean | null = null;

  // Translate values from `SearchEMail` to how the UI controls show it
  let isUnread: boolean | null = null;
  let sizeMinMB: number;
  let sizeMaxMB: number;

  // $: search, loadSearch() // only when a different search is loaded, *not* `$search` when its contents change -- TODO Unfortunately, triggers when anything in this file does `search.foo =`
  onMount(loadSearch);
  function loadSearch() {
    console.log("loadSearch", search);
    // Enable/disable: `SearchEmail` to controls
    hasAccount = search.account ? true : null;
    hasFolder = search.folder ? true : null;
    hasPerson = search.includesPerson ? true : null;
    hasAttachment = search.hasAttachment;
    hasTag = search.tags.hasItems ? true : null;
    hasSizeMax = search.sizeMax ? true : null;
    hasSizeMin = search.sizeMin ? true : null;

    // Translate values from `SearchEMail` to UI controls
    isUnread = search.isRead === null ? null : !search.isRead;
    sizeMinMB = search.sizeMin / 1048576;
    sizeMaxMB = search.sizeMax / 1048576;
  }

  // Translate values from UI controls to `SearchEMail`
  $: isUnread, updateUnread()
  function updateUnread() {
    search.isRead = isUnread === null ? null : !isUnread;
  }
  $: hasSizeMin, sizeMinMB, updateSizeMin();
  function updateSizeMin() {
    search.sizeMin = hasSizeMin ? sizeMinMB * 1048576 : null;
  }
  $: hasSizeMax, sizeMaxMB, updateSizeMax();
  function updateSizeMax() {
    search.sizeMax = hasSizeMax ? sizeMaxMB * 1048576 : null;
  }

  // Enable/disable: From UI controls to `SearchEMail`
  let account = $selectedAccount;
  let folder = $selectedFolder;
  let selectedFolders: ArrayColl<Folder>;
  $: hasAccount, account, updateAccount()
  function updateAccount() {
    search.account = hasAccount ? account : null;
  }
  $: hasFolder, folder, updateFolder()
  function updateFolder() {
    search.folder = hasFolder ? folder : null;
  }
  $: availablePersons = hasPerson && searchMessages ? personsInEMails(searchMessages) : appGlobal.personalAddressbook.persons;
  $: hasPerson, updatePerson()
  function updatePerson() {
    if (!hasPerson) {
      search.includesPerson = null;
    }
  }
  $: hasTag, updateTag()
  function updateTag() {
    if (!hasTag) {
      search.tags?.clear();
    }
  }
  $: hasAttachment, updateAttachment()
  function updateAttachment() {
    search.hasAttachment = hasAttachment;
    if (!hasAttachment) {
      search.hasAttachmentMIMETypes.clear();
    }
  }

  $: console.log("isFolder", hasFolder, "folder", folder?.name, "search folder", search.folder?.name);
</script>

<style>
  .term {
    margin-block-start: 8px;
    margin-block-end: 24px;
    font-size: 16px;
    align-items: center;
  }
  .term :global(.search) {
    margin: 0px 8px;
  }
  .term :global(input) {
    font-size: 16px;
  }
  .search-criteria :global(.star.starred svg) {
    fill: orange;
  }
  .search-criteria :global(.unread.is-unread svg) {
    fill: green;
  }
  .listbox {
    margin-block-start: 4px;
    margin-block-end: 16px;
    min-height: 200px;
  }
  .tags {
    margin-block-start: 8px;
    margin-block-end: 16px;
    margin-inline-start: 8px;
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
</style>
