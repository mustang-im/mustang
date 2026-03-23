<vbox class="key-import">
  <hbox class="import">
    <hbox class="label">{$t`Import from`}</hbox>
    <hbox class="buttons">
      <Button
        label={$t`Key server`}
        icon={CloudIcon}
        onClick={onQueryKeyserver}
        classes="keyserver"
        />
      <Button
        label={$t`File`}
        icon={FileIcon}
        onClick={onImportFile}
        classes="import-file"
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
</vbox>

<FileSelector {acceptFileTypes} bind:this={fileSelector} />

<script lang="ts">
  import { PublicKey, TrustLevel } from "../../../logic/Mail/Encryption/PublicKey";
  import { PGPPublicKey } from "../../../logic/Mail/Encryption/PGP/PGPPublicKey";
  import { SMIMEPublicKey } from "../../../logic/Mail/Encryption/SMIME/SMIMEPublicKey";
  import { Person } from "../../../logic/Abstract/Person";
  import { importPublicKey } from "../../../logic/Mail/Encryption/KeyUtils";
  import FileSelector from "../../Mail/Composer/Attachments/FileSelector.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import Button from "../../Shared/Button.svelte";
  import CloudIcon from "lucide-svelte/icons/cloud-download";
  import FileIcon from "lucide-svelte/icons/file-lock";
  import CloseIcon from "lucide-svelte/icons/x";
  import { t } from "../../../l10n/l10n";
  import { NotImplemented } from "../../../logic/util/util";

  export let person: Person;
  /** in/out */
  export let isOpen: boolean;

  let fileSelector: FileSelector;
  const acceptFileTypes = [ "application/pgp-keys", ".asc", "application/pkix-cert", "application/pkcs7-certificates", "application/x-x509-user-cert", "application/x-x509-ca-cert", "text/plain" ];
  async function onImportFile() {
    let file = await fileSelector.selectFile();
    if (!file) {
      return;
    }
    let fileContent = await file.text();
    let key = await importPublicKey(fileContent);
    person.encryptionPublicKeys.add(key);
    isOpen = false;
    await person.save();
  }

  async function onQueryKeyserver() {
    throw new NotImplemented();
    isOpen = false;
  }

  function makeFakeKey(): PublicKey {
    let key = Math.random() > 0.5 ? new PGPPublicKey() : new SMIMEPublicKey();
    key.obsolete = Math.random() > 0.2;
    key.encryptByDefault = Math.random() > 0.5;
    if (Math.random() < 0.2) {
      key.trustLevel = TrustLevel.Personal;
    }
    console.log("mails", person.emailAddresses.contents)
    for (let contact of person.emailAddresses) {
      key.userIDs.add(contact.value);
    }
    person.encryptionPublicKeys.add(key);
    return key;
  }
</script>

<style>
  .key-import {
    align-items: stretch;
    background-color: var(--main-pattern-bg);
    color: var(--main-pattern-fg);
    border-radius: 2px;
    box-shadow: 1px 1px 1px 0px rgba(0, 0, 0, 15%);
    margin: 4px 0px;
    padding: 12px 16px;
  }
  .import {
    align-items: center;
  }
  .label {
    margin-inline-end: 12px;
  }
  .buttons {
    gap: 8px;
    flex-wrap: wrap;
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
