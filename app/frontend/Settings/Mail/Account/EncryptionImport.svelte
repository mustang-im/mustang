<vbox class="key-import">
  <hbox class="import">
    <hbox class="label">{$t`Import from`}</hbox>
    <hbox class="buttons">
      <hbox bind:this={appsButton}>
        <Button
          label={$t`App`}
          icon={AppIcon}
          onClick={onImportFromApps}
          />
      </hbox>
      <Button
        label={$t`File`}
        icon={FileIcon}
        onClick={onImportFile}
        />
      <hbox class="spacer" />
      <RoundButton
        label={$t`Close`}
        icon={CloseIcon}
        onClick={() => isOpen = false}
        border={false}
        classes="plain close"
        padding="4px"
        />
    </hbox>
  </hbox>
  <hbox class="create buttons">
    <Button
      label={$t`Create new`}
      icon={PlusIcon}
      onClick={onCreateNew}
      />
  </hbox>
</vbox>

<FileSelector {acceptFileTypes} bind:this={fileSelector} />

<Menu bind:isMenuOpen={isAppsMenuOpen} anchor={appsButton}>
  <MenuItem label="Thunderbird" onClick={onImportFromThunderbird} />
  <MenuItem label="Outlook" onClick={onImportFromOutlook} />
  <MenuItem label="Apple Mail" onClick={onImportFromAppleMail} />
  <MenuItem label="GnuPG" onClick={onImportFromGnuPG} />
</Menu>

<script lang="ts">
  import { PublicKey, TrustLevel } from "../../../../logic/Mail/Encryption/PublicKey";
  import { PGPPrivateKey } from "../../../../logic/Mail/Encryption/PGP/PGPPrivateKey";
  import { SMIMEPrivateKey } from "../../../../logic/Mail/Encryption/SMIME/SMIMEPrivateKey";
  import { MailIdentity } from "../../../../logic/Mail/MailIdentity";
  import FileSelector from "../../../Mail/Composer/Attachments/FileSelector.svelte";
  import Menu from "../../../Shared/Menu/Menu.svelte";
  import MenuItem from "../../../Shared/Menu/MenuItem.svelte";
  import RoundButton from "../../../Shared/RoundButton.svelte";
  import Button from "../../../Shared/Button.svelte";
  import PlusIcon from "lucide-svelte/icons/plus";
  import FileIcon from "lucide-svelte/icons/file-lock";
  import AppIcon from "lucide-svelte/icons/app-window";
  import CloseIcon from "lucide-svelte/icons/x";
  import { t } from "../../../../l10n/l10n";

  export let identity: MailIdentity;
  /** in/out */
  export let isOpen: boolean;

  $: console.log("open", isOpen);

  let fileSelector: FileSelector;
  const acceptFileTypes = [ "application/pgp-keys", "application/pgp-encrypted" ];
  async function onImportFile() {
    let file = await fileSelector.selectFile();
    if (!file) {
      return;
    }
    isOpen = false;
  }

  let isAppsMenuOpen = false;
  let appsButton: HTMLElement;
  async function onImportFromApps() {
    isAppsMenuOpen = true;
  }
  async function onImportFromThunderbird() {
    isOpen = false;
  }
  async function onImportFromGnuPG() {
    isOpen = false;
  }
  async function onImportFromOutlook() {
    isOpen = false;
  }
  async function onImportFromAppleMail() {
    isOpen = false;
  }

  async function onCreateNew() {
    makeKey().obsolete = false;
    isOpen = false;
  }

  function makeKey(): PublicKey {
    let key = Math.random() > 0.5 ? new PGPPrivateKey() : new SMIMEPrivateKey();
    if (Math.random() < 0.2) {
      key.trustLevel = TrustLevel.Personal;
    }
    key.userIDs.add(identity.emailAddress);
    identity.encryptionPrivateKeys.add(key);
    key.justCreated = true;
    return key;
  }
  </script>

<style>
  .key-import {
    background-color: var(--main-pattern-bg);
    color: var(--main-pattern-fg);
    border-radius: 2px;
    box-shadow: 1px 1px 1px 0px rgba(0, 0, 0, 15%);
    margin: 4px 0px;
    padding: 12px 16px;
    width: calc(100% - 32px); /* TODO use flex */
    flex: 1 1 0;
  }
  .import {
    align-items: center;
    margin-block-start: 8px;
    margin-block-end: 8px;
  }
  .create {
    justify-content: end;
    margin-block-end: 4px;
  }
  .label {
    margin-inline-end: 12px;
  }
  .buttons {
    gap: 8px;
    flex-wrap: wrap;
  }
  .import .buttons {
    justify-content: end;
    flex: 1 1 0;
  }
  .spacer {
    flex: 1 1 0;
  }
  .buttons :global(.close) {
    align-self: start;
    margin-inline-end: -8px;
    margin-block-start: -4px;
  }
</style>
