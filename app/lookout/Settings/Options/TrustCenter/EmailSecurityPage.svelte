<vbox class="email-security">
  <OptionsSection title={$t`Encrypted email`}>
    <OptionsRow icon={EncryptIcon}>
      {#if setting}
        <hbox class="field-row">
          <span class="field-label">{$t`Default Setting:`}</span>
          <ComboBox options={identityOptions} value={setting.identity} label={$t`Default Setting`} width="340px"
            onChange={onIdentity} />
          <DialogButton label={$t`Settings…`} onClick={() => { isSettingsOpen = true; }}
            disabled={!setting.choosableKeys.length && noKeyReason} />
        </hbox>
        <CheckBox label={$t`Encrypt contents and attachments for outgoing messages`}
          checked={setting.encrypt} disabled={!setting.key && noKeyReason}
          onChange={checked => { setting.setEncrypt(checked); setting = setting; }} />
        <CheckBox label={$t`Add digital signature to outgoing messages`}
          checked={setting.sign}
          disabled={!setting.key ? noKeyReason : setting.encrypt && $t`Encrypted messages are always signed`}
          onChange={checked => { setting.setSign(checked); setting = setting; }} />
        {#if !setting.key}
          <span class="hint">{noKeyReason}</span>
        {/if}
      {:else}
        <span class="hint">{$t`Add an email account first.`}</span>
      {/if}
    </OptionsRow>
  </OptionsSection>
  <OptionsSection title={$t`Digital IDs (Certificates)`}>
    <OptionsRow icon={CertificateIcon}>
      <span>{$t`Digital IDs or Certificates are documents that allow you to prove your identity in electronic transactions.`}</span>
      <hbox class="buttons">
        <DialogButton label={$t`Import/Export…`} onClick={() => { isImportExportOpen = true; }}
          disabled={!setting && $t`Add an email account first.`} />
        <DialogButton label={$t`Get a Digital ID…`} onClick={() => { isGetOpen = true; }}
          disabled={!setting && $t`Add an email account first.`} />
      </hbox>
    </OptionsRow>
  </OptionsSection>
  <OptionsSection title={$t`Read as Plain Text`}>
    <OptionsRow icon={PlainTextIcon}>
      <CheckBox label={$t`Read all standard mail in plain text`} bind:checked={readAsPlainText} />
    </OptionsRow>
  </OptionsSection>
</vbox>

{#if isSettingsOpen && setting}
  <SecuritySettingsDialog {setting} on:close={() => { isSettingsOpen = false; setting = setting; }} />
{/if}
{#if isImportExportOpen && setting}
  <DigitalIDDialog identity={setting.identity} identities={identities} onChanged={onKeysChanged}
    on:close={() => { isImportExportOpen = false; }} />
{/if}
{#if isGetOpen && setting}
  <GetDigitalIDDialog identity={setting.identity} identities={identities} onChanged={onKeysChanged}
    on:close={() => { isGetOpen = false; }} />
{/if}

<script lang="ts">
  import type { MailIdentity } from "../../../../logic/Mail/MailIdentity";
  import type { EmailSecurityDraft } from "./EmailSecurityDraft";
  import { DigitalIDs } from "./DigitalIDs";
  import OptionsSection from "../OptionsSection.svelte";
  import OptionsRow from "../OptionsRow.svelte";
  import SecuritySettingsDialog from "./SecuritySettingsDialog.svelte";
  import DigitalIDDialog from "./DigitalIDDialog.svelte";
  import GetDigitalIDDialog from "./GetDigitalIDDialog.svelte";
  import CheckBox from "../../../Shared/Form/CheckBox.svelte";
  import ComboBox from "../../../Shared/Form/ComboBox.svelte";
  import DialogButton from "../../../Shared/Dialog/DialogButton.svelte";
  import EncryptIcon from "lucide-svelte/icons/lock-keyhole";
  import CertificateIcon from "lucide-svelte/icons/badge-check";
  import PlainTextIcon from "lucide-svelte/icons/file-text";
  import { t } from "../../../../l10n/l10n";

  export let draft: EmailSecurityDraft;
  export let identity: MailIdentity = null;
  export let readAsPlainText: boolean;

  let setting = draft.settingFor(identity);
  let isSettingsOpen = false;
  let isImportExportOpen = false;
  let isGetOpen = false;

  $: identities = draft.settings.map(listed => listed.identity);
  $: identityOptions = identities.map(listed => ({ value: listed, label: DigitalIDs.identityLabel(listed) }));
  $: noKeyReason = !setting ? null
    : setting.choosableKeys.length ? $t`Your Digital ID for ${setting.identity.emailAddress} is waiting for its certificate. Request or add it with Settings….`
    : $t`You don't have a Digital ID for ${setting.identity.emailAddress} yet. Import one or get a new one below.`;

  function onIdentity(chosen: MailIdentity) {
    setting = draft.settingFor(chosen);
  }

  function onKeysChanged(changed: MailIdentity) {
    draft.settingFor(changed).keysChanged();
    setting = draft.settingFor(changed);
  }
</script>

<style>
  .email-security {
    gap: 4px;
  }
  .field-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-block-end: 4px;
  }
  .field-label {
    flex-shrink: 0;
    width: 120px;
  }
  .hint {
    color: var(--lo-fg-secondary);
    font-size: var(--lo-font-size-small);
  }
  .buttons {
    gap: 8px;
  }
  .buttons :global(.dialog-button) {
    min-width: 140px;
  }
</style>
