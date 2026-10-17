<Dialog title={$t`Change Security Settings`} okLabel={$t`OK`} onOK={onOK} width="580px" on:close>
  <vbox class="security-settings">
    <GroupBox label={$t`Preferred Security Settings`}>
      <FormGrid columns="170px minmax(0, 1fr)">
        <span>{$t`Security Settings Name:`}</span>
        <TextField value={DigitalIDs.identityLabel(setting.identity)} readonly label={$t`Security Settings Name`} />
        <span>{$t`Cryptography Format:`}</span>
        <TextField value={key?.system ?? ""} readonly label={$t`Cryptography Format`} />
      </FormGrid>
    </GroupBox>
    <GroupBox label={$t`Certificates and Algorithms`}>
      <FormGrid columns="170px minmax(0, 1fr)">
        <span>{$t`Signing Certificate:`}</span>
        <ComboBox options={keyOptions} bind:value={key} label={$t`Signing Certificate`} />
        {#if key}
          <span>{$t`Issued to:`}</span>
          <span class="value">{key.userIDs.contents.join(", ") || "-"}</span>
          <span>{$t`Issued by:`}</span>
          <span class="value">{key.caName || $t`Not certified by a certification authority`}</span>
          <span>{$t`Valid to:`}</span>
          <span class="value">{key.expires ? getDateString(key.expires) : $t`No end date`}</span>
          <span>{$t`Verification code:`}</span>
          <span class="value code">{key.fingerprintDisplay}</span>
          {#if key instanceof SMIMEPrivateKey}
            <span>{$t`Certificate:`}</span>
            <vbox class="status">
              {#await statusAsync then status}
                <span class="value">{DigitalIDs.statusText(status)}</span>
                {#if DigitalIDs.needsCertificate(status)}
                  <hbox class="status-buttons">
                    <DialogButton label={$t`Request Certificate…`} onClick={() => { isRequestOpen = true; }} />
                    <DialogButton label={$t`Add Certificate…`} onClick={onAddCertificate} />
                  </hbox>
                {/if}
              {:catch ex}
                <span class="value error">{ex?.message ?? ex}</span>
              {/await}
            </vbox>
          {/if}
        {/if}
      </FormGrid>
    </GroupBox>
  </vbox>
</Dialog>

<FileSelector bind:this={fileSelector} {acceptFileTypes} />
{#if isRequestOpen && key instanceof SMIMEPrivateKey}
  <CertificateRequestDialog identity={setting.identity} {key} on:close={() => { isRequestOpen = false; }} />
{/if}

<script lang="ts">
  import type { IdentitySecurity } from "./EmailSecurityDraft";
  import { DigitalIDs, type DigitalID } from "./DigitalIDs";
  import { SMIMEPrivateKey } from "../../../logic/Mail/Encryption/SMIME/SMIMEPrivateKey";
  import { getDateString } from "../../../frontend/Util/date";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import DialogButton from "../../Shared/Dialog/DialogButton.svelte";
  import FormGrid from "../../Shared/Form/FormGrid.svelte";
  import GroupBox from "../../Shared/Form/GroupBox.svelte";
  import TextField from "../../Shared/Form/TextField.svelte";
  import ComboBox from "../../Shared/Form/ComboBox.svelte";
  import CertificateRequestDialog from "./CertificateRequestDialog.svelte";
  import FileSelector from "../../../frontend/Mail/Composer/Attachments/FileSelector.svelte";
  import { t } from "../../../l10n/l10n";

  export let setting: IdentitySecurity;

  let key: DigitalID = setting.key ?? setting.choosableKeys[0] ?? null;
  let fileSelector: FileSelector;
  let isRequestOpen = false;
  // <copied from="../../../frontend/Settings/Mail/Account/EncryptionKey.svelte">
  const acceptFileTypes = [ "application/x-x509-email-cert", "application/x-x509-ca-cert", "application/pkix-cert", ".crt", "application/x-pem-file", ".pem" ];
  // </copied>
  let statusAsync = keyStatus(key);

  $: keyOptions = setting.choosableKeys.map(listed => ({
    value: listed,
    label: setting.keys.includes(listed) ? DigitalIDs.label(listed) : $t`${DigitalIDs.label(listed)} - waiting for the certificate`,
  }));
  $: statusAsync = keyStatus(key);

  function keyStatus(listed: DigitalID) {
    return listed instanceof SMIMEPrivateKey ? listed.keyStatus() : Promise.resolve(null);
  }

  async function onAddCertificate() {
    let file = await fileSelector.selectFile();
    if (!file || !(key instanceof SMIMEPrivateKey)) {
      return;
    }
    await DigitalIDs.addCertificateFile(setting.identity, key, file);
    statusAsync = keyStatus(key);
    setting.keysChanged();
    setting = setting;
  }

  function onOK() {
    if (key && setting.keys.includes(key)) {
      setting.setKey(key);
    }
  }
</script>

<style>
  .security-settings {
    gap: 12px;
  }
  .value {
    min-width: 0;
    overflow-wrap: anywhere;
    color: var(--lo-fg-secondary);
  }
  .code {
    font-family: "Cascadia Mono", Consolas, monospace;
    letter-spacing: 0.04em;
  }
  .status {
    gap: 8px;
  }
  .status-buttons {
    gap: 8px;
  }
  .error {
    color: var(--lo-danger);
  }
</style>
