<vbox class="certificates-page">
  <span class="intro">{$t`${appName} uses one of these certificates to send encrypted mail to this contact. You get a certificate when the contact sends you digitally signed mail, or when you import a certificate file for the contact.`}</span>
  <span class="list-label">{$t`Certificates (Digital IDs):`}</span>
  <hbox class="list-and-buttons">
    <vbox flex class="list">
      <ListView items={sortedKeys} bind:selected label={$t`Certificates`} height="240px"
        columns={[{ label: $t`Name` }, { label: $t`Type`, width: "90px" }, { label: $t`Valid to`, width: "110px" }, { label: $t`Status`, width: "110px" }]}
        onOpen={() => { isPropertiesOpen = true; }}
        let:item>
        <span class="cell">{nameOf(item)}</span>
        <span class="cell">{item.system}</span>
        <span class="cell">{item.expires ? getDateString(item.expires) : "-"}</span>
        <span class="cell">{ContactCertificates.statusOf(item)}</span>
        <span slot="empty">{$t`This contact has no certificate yet.`}</span>
      </ListView>
    </vbox>
    <vbox class="buttons">
      <DialogButton label={$t`Properties…`} disabled={!selected && $t`Select a certificate first`}
        onClick={() => { isPropertiesOpen = true; }} />
      <DialogButton label={$t`Set as Default`}
        disabled={!selected ? $t`Select a certificate first` : (selected.obsolete || selected.trustLevel == TrustLevel.Distrusted) && $t`This certificate is not trusted or not valid`}
        onClick={onSetAsDefault} />
      <DialogButton label={$t`Import…`} onClick={onImport} />
      <DialogButton label={$t`Export…`} disabled={!selected && $t`Select a certificate first`}
        onClick={onExport} />
      <DialogButton label={$t`Remove`} disabled={!selected && $t`Select a certificate first`}
        onClick={onRemove} />
    </vbox>
  </hbox>
</vbox>
<FileSelector bind:this={fileSelector} {acceptFileTypes} />

{#if isPropertiesOpen && selected}
  <CertificatePropertiesDialog key={selected} personName={person.name || $t`this person`}
    on:close={() => { isPropertiesOpen = false; revision++; }} />
{/if}

<script lang="ts">
  import type { Person } from "../../../logic/Abstract/Person";
  import type { PublicKey } from "../../../logic/Mail/Encryption/PublicKey";
  import { ContactCertificates } from "../Form/ContactCertificates";
  import { MessageBox } from "../../Shared/Dialog/MessageBox";
  import { TrustLevel } from "../../../logic/Mail/Encryption/enums";
  import { importPublicKey } from "../../../logic/Mail/Encryption/KeyUtils";
  import { saveBlobAsFile } from "../../../frontend/Util/util";
  import { appName } from "../../../logic/build";
  import { getDateString } from "../../../frontend/Util/date";
  import ListView from "../../Shared/Form/ListView.svelte";
  import DialogButton from "../../Shared/Dialog/DialogButton.svelte";
  import CertificatePropertiesDialog from "./CertificatePropertiesDialog.svelte";
  import FileSelector from "../../../frontend/Mail/Composer/Attachments/FileSelector.svelte";
  import { t } from "../../../l10n/l10n";

  export let person: Person;

  // <copied from="../../../frontend/Contacts/PersonPage/EncryptionImport.svelte">
  const acceptFileTypes = [ "application/pgp-keys", ".asc", "application/pkix-cert", "application/pkcs7-certificates", "application/x-x509-user-cert", "application/x-x509-ca-cert", "application/x-pem-file", ".pem", "text/plain" ];
  // </copied>

  let fileSelector: FileSelector;
  let selected: PublicKey = null;
  let isPropertiesOpen = false;
  let revision = 0;

  $: keys = person.encryptionPublicKeys;
  let sortedKeys: PublicKey[] = [];
  $: revision, sortedKeys = [...$keys.contents].sort((a, b) => a.sortOrder - b.sortOrder);

  function nameOf(key: PublicKey): string {
    return key.name || key.userIDs.first || key.defaultName;
  }

  function onSetAsDefault() {
    for (let existing of person.encryptionPublicKeys) {
      existing.encryptByDefault = existing == selected;
    }
    revision++;
  }

  async function onImport() {
    let file = await fileSelector.selectFile();
    if (!file) {
      return;
    }
    // <copied from="../../../frontend/Contacts/PersonPage/EncryptionImport.svelte" onImportFile()>, saved with the contact form
    let fileContent = await file.text();
    let key = await importPublicKey(fileContent);
    person.addEncryptionPublicKey(key);
    // </copied>
  }

  async function onExport() {
    // <copied from="../../../frontend/Contacts/PersonPage/EncryptionKey.svelte" onExport()>
    await saveBlobAsFile(selected.publicKeyAsFile());
    // </copied>
  }

  async function onRemove() {
    if (!await MessageBox.ask($t`Certificates`, $t`Do you want to remove the certificate ${nameOf(selected)}? You will no longer be able to check messages signed with it.`)) {
      return;
    }
    person.encryptionPublicKeys.remove(selected);
    selected = null;
  }
</script>

<style>
  .certificates-page {
    flex: 1;
    gap: 12px;
    max-width: 760px;
    padding: 4px 0;
  }
  .intro {
    color: var(--lo-fg-secondary);
  }
  .list-label {
    font-weight: 600;
  }
  .list-and-buttons {
    gap: 12px;
    align-items: start;
  }
  .list {
    min-width: 0;
  }
  .buttons {
    gap: 8px;
    width: 130px;
  }
  .buttons :global(button) {
    width: 100%;
  }
  .cell {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
