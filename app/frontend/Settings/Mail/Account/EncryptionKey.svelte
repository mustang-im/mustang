<vbox class="key" class:obsolete={$key.obsolete}>
  <hbox class="main-row"
    on:click={() => isExpanded = !isExpanded}>
    <hbox class="usage"
      style:background-color={$key.obsolete ? "grey" : "green"}
      style:color={$key.obsolete ? "black" : "white"}>
      {#if $key.obsolete}
        <DistrustIcon title={$t`Obsolete`} size="16px" />
      {:else if $key.encryptByDefault}
        <EncryptIcon title={$t`Use for encryption and signing`} size="16px" />
      {:else if $key.useToSign}
        <SignIcon title={$t`Use only for signing messages`} size="16px" />
      {:else}
        <UnusedIcon title={$t`Used only on demand`} size="16px" />
      {/if}
    </hbox>
    <hbox class="name">{$key.name}</hbox>
    {#if isExpanded}
      <hbox class="keytype" flex>{$t`Secret key`}</hbox>
    {:else}
      <hbox flex />
    {/if}
    <hbox class="system font-small">
      {key.system}
    </hbox>
    <RoundButton
      label={isExpanded ? $t`Collapse` : $t`Expand`}
      icon={isExpanded ? ChevronUp : ChevronDown}
      border={false}
      classes="plain"
      />
  </hbox>
  {#if isExpanded}
    <vbox class="details">
      {#if $key.obsolete}
        <hbox class="obsolete-detail">
          <hbox class="label">{$t`Obsolete`}</hbox>
          <hbox>{$t`Do not use this key for new messages`}</hbox>
        </hbox>
      {:else}
        <hbox class="usage-detail">
          <hbox class="label">{$t`Usage`}</hbox>
          <vbox>
            <Checkbox toggle
              bind:checked={key.useToSign}
              disabled={$key.obsolete}
              label={$t`Sign emails that I send *=> I will sign outgoing emails`} />
            <Checkbox toggle
                bind:checked={key.encryptByDefault}
                disabled={$key.obsolete}
                label={$t`I want to receive encrypted emails`} />
            {#if $key.encryptByDefault}
              <div class="note">{$t`This is merely a request to your correspondents. The sender also needs to have encryption enabled for messages between you two to be encrypted.`}</div>
              {#if !$key.didBackup}
                <div class="warning note">{$t`To read encrypted emails, you need to use ${appName} (or another app that supports ${key.system}) on your other devices as well.`}</div>
                <div class="warning note">{$t`Please save your private key, on a different device. If you lose the key, you will not be able to read your own encrypted emails anymore.`}</div>
              {/if}
            {/if}
          </vbox>
        </hbox>
      {/if}
      <hbox class="verification-code" class:obsolete={$key.obsolete}>
        <hbox class="label">{$t`Verification code`}</hbox>
        <vbox class="value">
          <hbox>{key.fingerprintDisplay.substring(0, 24)}</hbox>
          <hbox>{key.fingerprintDisplay.substring(25)}</hbox>
        </vbox>
      </hbox>
      <hbox>
        <hbox class="label">{$t`Created`}</hbox>
        <hbox class="value">{getDateString(key.created)}</hbox>
        <hbox class="label-2-column">{$t`Expires`}</hbox>
        <hbox class="value" title={key.expires ? getDateTimeString(key.expires) : null}>{key.expires ? getDateString(key.expires) : "-"}</hbox>
      </hbox>
      <hbox>
        <hbox class="label">{$t`ID`}</hbox>
        <hbox class="value">{key.id}</hbox>
      </hbox>
      {#if key.cipher}
        <hbox>
          <hbox class="label">{$t`Cipher`}</hbox>
          <hbox class="value">{key.cipher}</hbox>
          {#if key.keyLengthInBits}
            <hbox class="label-2-column">{$t`Length`}</hbox>
            <hbox>{key.keyLengthInBits} {$t`bits`}</hbox>
          {/if}
        </hbox>
      {/if}
      <hbox>
        <hbox class="label">{$t`Name`}</hbox>
        <input type="text" bind:value={key.name} spellcheck={false} />
      </hbox>
      <hbox class="valid-for">
        <hbox class="label">{$t`User IDs`}</hbox>
        <vbox>
          {#each key.userIDs.each as userID}
            <hbox class="userid">{userID}</hbox>
          {/each}
        </vbox>
      </hbox>
      <hbox>
        <hbox class="buttons">
          {#if !key.obsolete}
            <Button
              label={$t`Export public part… *=> Export the public key`}
              icon={ExportPublicIcon}
              onClick={onExportPublic}
              />
            <Button
              label={$t`Backup secret… *=> Export a backup file for the secret encryption key`}
              icon={ExportPrivateIcon}
              onClick={onExportPrivate}
              />
          {/if}
          <Button
            label={key.obsolete ? $t`Restore` : $t`Obsolete`}
            icon={ObsoleteIcon}
            onClick={() => key.obsolete = !key.obsolete}
            />
          {#if key.obsolete || key.justCreated}
            <RoundButton
              label={$t`Delete`}
              icon={DeleteIcon}
              onClick={onDelete}
              />
          {/if}
        </hbox>
      </hbox>
    </vbox>
  {/if}
</vbox>

<script lang="ts">
  import type { PrivateKey, PublicKey } from "../../../../logic/Mail/Encryption/PublicKey";
  import { MailIdentity } from "../../../../logic/Mail/MailIdentity";
  import { saveBlobAsFile } from "../../../Util/util";
  import { appName } from "../../../../logic/build";
  import Checkbox from "../../../Shared/Checkbox.svelte";
  import RoundButton from "../../../Shared/RoundButton.svelte";
  import Button from "../../../Shared/Button.svelte";
  import SignIcon from "lucide-svelte/icons/signature";
  import EncryptIcon from "lucide-svelte/icons/lock";
  import UnusedIcon from "lucide-svelte/icons/circle-dashed";
  import DistrustIcon from "lucide-svelte/icons/octagon-x";
  import ExportPublicIcon from "lucide-svelte/icons/share-2";
  import ExportPrivateIcon from "lucide-svelte/icons/key-round";
  import ObsoleteIcon from "lucide-svelte/icons/octagon-x";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import ChevronUp from "lucide-svelte/icons/chevron-up";
  import ChevronDown from "lucide-svelte/icons/chevron-down";
  import { getDateString, getDateTimeString } from "../../../Util/date";
  import { t } from "../../../../l10n/l10n";

  export let key: PublicKey & PrivateKey;
  export let identity: MailIdentity;

  let isExpanded = false;

  async function onExportPrivate() {
    await saveBlobAsFile(key.privateKeyAsFile());
    key.didBackup = true;
    await identity.account.save();
  }
  async function onExportPublic() {
    await saveBlobAsFile(key.publicKeyAsFile());
  }
  async function onDelete() {
    if (!key.justCreated) {
      if (!confirm(`WARNING\nYou will not be able to read your own emails which are encrypted with this key - both old and new emails.\nMake sure that you have a backup of the key.\nDo you want to delete your own private key?`)) {
        return;
      }
    }
    identity.encryptionPrivateKeys.remove(key);
    await identity.account.save();
  }
</script>

<style>
  .key {
    background-color: var(--main-pattern-bg);
    color: var(--main-pattern-fg);
    border-radius: 2px;
    box-shadow: 1px 1px 1px 0px rgba(0, 0, 0, 15%);
    margin: 4px 0px;
  }
  .main-row {
    align-items: center;
    padding: 0px 8px;
  }
  .main-row:hover {
    background-color: var(--hover-bg);
    color: var(--hover-fg);
  }
  .usage {
    border-radius: var(--border-radius);
    padding: 4px;
  }
  .name {
    margin-inline: 16px;
    font-weight: bold;
  }
  .keytype {
    justify-content: center;
  }
  .key.obsolete {
    opacity: 70%;
  }
  .key.obsolete .usage {
    opacity: 50%;
  }
  .system {
    opacity: 70%;
    justify-content: end;
  }
  .details {
    margin: 12px 24px 0px 48px;
  }
  .details .label {
    min-width: 8em;
    margin-inline-end: 8px;
    flex-wrap: wrap;
    opacity: 65%;
  }
  .details .label-2-column {
    margin-inline-start: 32px;
    margin-inline-end: 8px;
    opacity: 65%;
  }
  .verification-code:not(.obsolete) {
    margin-block: 24px;
  }
  .verification-code .label {
    padding-block: 7px;
  }
  .verification-code .value {
    padding-block: 8px;
    letter-spacing: 0.05em;
    font-family: 'Courier New', Courier, monospace;
    font-size: 15px;
  }
  .verification-code:not(.obsolete) .value {
    background-color: var(--bg);
    color: var(--fg);

    padding-inline: 12px;
    font-weight: 500;
  }
  .warning {
    background-color: yellow;
    color: darkred;
  }
  .note {
    padding: 6px 12px;
  }
  .usage-detail {
    padding-block-start: 6px;
  }
  .buttons {
    gap: 8px;
    margin-block-start: 8px;
    margin-block-end: 16px;
    width: 100%;
    justify-content: end;
  }
</style>
