<grid class="main">
  <label for="name">{$t`Folder name`}</label>
  <input type="text" bind:value={folderName} name="name" readonly={!!disableRename} />
  <Button label={$t`Rename`}
    classes="create"
    onClick={onNameChange}
    disabled={disableRename}
    />

  <label for="count">{$t`Use as`}</label>
  <SpecialFolderDropDown bind:specialFolderType={folder.specialFolder} disabled={disableSpecial} />
  <Button label={$t`Save`}
    onClick={onChangeSpecialFolder}
    disabled={disableSpecial}
    />

    <label for="count">{$t`Messages`}</label>
  <hbox class="value" name="count">
    {#if $folder.countTotal > 0}
      {$t`${$folder.countNewArrived} new,
          ${$folder.countUnread} unread,
          ${$folder.countTotal} total messages.`}
    {/if}
    {#if $folder.countTotal > 0 && $folder.countTotal != $messages.length}
      {#if $messages.length == 0}
        {$t`Not opened yet.`}
      {:else}
        {$t`${$messages.length} displayed.`}
      {/if}
    {/if}
    {#if $folder.countTotal > 0 && $folder.countTotal == $downloadedMessages.length}
      {$t`All downloaded.`}
    {:else if $downloadedMessages.length > 0}
      {$t`${$downloadedMessages.length} downloaded messages.`}
    {/if}
  </hbox>
  <hbox />

  <hbox />
  <hbox class="buttons">
    <Button label={$t`Get new messages`}
      onClick={onGetNew}
      />
    <Button label={$t`Download all messages`}
      onClick={() => refreshHack(onDownloadAll)}
      />
    <Button label={$t`Full re-sync`}
      onClick={() => refreshHack(onFullResync)}
      />
    <Button label={$t`Mark all read`}
      onClick={onMarkAllRead}
      />
  </hbox>
  <hbox/>

  {#if imapPermissions}
    <label for="permissions">{$t`Folder permissions`}</label>
    <PersonsAutocomplete persons={imapPermissions} placeholder={$t`Add permission`} {onAddPerson} {onRemovePerson}>
      <hbox slot="result-bottom-row" class="recipient-email-address font-small" let:person>
        {person.emailAddress}
      </hbox>
      <FolderIMAPPermissions slot="person-popup-bottom" let:person {person} {folder}/>
    </PersonsAutocomplete>
    <hbox/>
  {/if}

  {#if exchangePermissions}
    <label for="permissions">{$t`Folder permissions`}</label>
    <PersonsAutocomplete persons={exchangePermissions} placeholder={$t`Add permission`} {onAddPerson} {onRemovePerson}>
      <hbox slot="result-bottom-row" class="recipient-email-address font-small" let:person>
        {person.emailAddress}
      </hbox>
      <FolderExchangePermissions slot="person-popup-bottom" let:person {person}/>
    </PersonsAutocomplete>
    <Button label={$t`Save Permissions`} onClick={onSavePermissions}/>
  {/if}
</grid>

<script lang="ts">
  import type { PersonUID } from "../../../../logic/Abstract/PersonUID";
  import type { Folder } from "../../../../logic/Mail/Folder";
  import { IMAPFolder, IMAPPermission } from "../../../../logic/Mail/IMAP/IMAPFolder";
  import { EWSFolder, ExchangePermission } from "../../../../logic/Mail/EWS/EWSFolder";
  import { OWAFolder } from "../../../../logic/Mail/OWA/OWAFolder";
  import SpecialFolderDropDown from "./SpecialFolderDropDown.svelte";
  import Button from "../../../Shared/Button.svelte";
  import PersonsAutocomplete from "../../../Contacts/PersonAutocomplete/PersonsAutocomplete.svelte";
  import FolderIMAPPermissions from "./FolderIMAPPermissions.svelte";
  import FolderExchangePermissions from "./FolderExchangePermissions.svelte";
  import { showError } from '../../../Util/error';
  import { assert } from "../../../../logic/util/util";
  import { t } from "../../../../l10n/l10n";
  import { EMail } from "../../../../logic/Mail/EMail";
  import type { ArrayColl, Collection } from "svelte-collections";

  export let folder: Folder;
  let previousFolder: Folder;
  let imapPermissions: ArrayColl<IMAPPermission> | undefined;
  let exchangePermissions: ArrayColl<ExchangePermission> | undefined;

  $: init($folder);

  let downloadedMessages: Collection<EMail>;
  $: messages = $folder.messages;
  $: downloadedMessages = $messages.filter(msg => msg.downloadComplete), refreshTrigger;
  $: disableSpecial = $folder.disableChangeSpecial();
  $: disableRename = $folder.disableRename();

  let folderName: string;
  async function init(_dummy: any) {
    if (folder == previousFolder) {
      return;
    }
    previousFolder = folder;
    folderName = folder.name;
    imapPermissions = undefined;
    exchangePermissions = undefined;
    if (folder instanceof IMAPFolder) {
      try {
        imapPermissions = await folder.getPermissions();
      } catch (ex) {
        showError(ex);
      }
    }
    if (folder instanceof EWSFolder || folder instanceof OWAFolder) {
      try {
        exchangePermissions = await folder.getPermissions();
      } catch (ex) {
        showError(ex);
      }
    }
  }
  async function onNameChange() {
    assert(folderName, $t`Name cannot be empty`);
    await folder.rename(folderName);
    await save();
  }

  async function onGetNew() {
    await folder.getNewMessages();
  }

  async function onDownloadAll() {
    await folder.listMessages();
    await folder.downloadAllMessages();
  }

  async function onFullResync() {
    await folder.fullResync();
    await folder.downloadAllMessages();
  }

  /** `downloadedMessages` depends on `.downloadComplete`
   * property of emails, not list of emails (emails added and removed),
   * Would need to observe all emails. Instead, use this hack for now. */
  let refreshTrigger = 0;
  async function refreshHack(asyncFunc: () => Promise<void>) {
    let interval = setInterval(() => {
      refreshTrigger++;
    }, 1000);
    try {
      await asyncFunc();
    } finally {
      refreshTrigger++;
      clearInterval(interval);
    }
  }

  async function onMarkAllRead() {
    await folder.markAllRead();
  }

  async function onChangeSpecialFolder() {
    await save();
  }

  async function save() {
    await folder.save();
  }

  function onAddPerson(person: PersonUID) {
    if (imapPermissions) {
      imapPermissions.add(new IMAPPermission(person.emailAddress, person.name));
    }
    if (exchangePermissions) {
      exchangePermissions.add(new ExchangePermission(person.emailAddress, person.name));
    }
  }

  async function onRemovePerson(person: PersonUID) {
    if (imapPermissions && await folder.removePermission(person)) {
      imapPermissions.remove(person as IMAPPermission);
    }
    if (exchangePermissions && !person.emailAddress.startsWith("*@")) {
      exchangePermissions.remove(person as ExchangePermission);
    }
  }

  async function onSavePermissions() {
    await folder.setPermissions(exchangePermissions);
  }
</script>

<style>
  grid.main {
    grid-template-columns: max-content auto max-content;
    gap: 8px 24px;
    align-items: center;
  }
  label {
    height: 100%;
  }
  .buttons {
    flex-wrap: wrap;
  }
  .buttons :global(button) {
    margin-inline-end: 6px;
    margin-block-end: 6px;
  }
  input[readonly] {
    opacity: 70%;
  }
</style>
