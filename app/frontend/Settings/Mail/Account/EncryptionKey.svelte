<vbox class="key" class:obsolete={$key.obsolete}>
  <hbox class="main-row"
    on:click={() => isExpanded = !isExpanded}>
    <hbox class="usage"
      style:background-color={$key.obsolete ? "grey" : "green"}
      style:color={$key.obsolete ? "black" : "white"}>
      {#if $key.obsolete}
        <DistrustIcon title={$t`Obsolete`} size="16px" />
      {:else if $key.useToEncrypt}
        <EncryptIcon title={$t`Use for encryption and signing`} size="16px" />
      {:else}
        <SignIcon title={$t`Use only for signing messages`} size="16px" />
      {/if}
    </hbox>
    <hbox class="name" flex>{$key.name}</hbox>
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
      <hbox>
        <hbox class="label" />
        <hbox>{$t`Secret key for ${key.system}`}</hbox>
      </hbox>
      <hbox>
        <hbox class="label">{$t`Created`}</hbox>
        <hbox class="value">{getDateString(key.created)}</hbox>
        <hbox class="label-2-column">{$t`Expires`}</hbox>
        <hbox class="value" title={getDateTimeString(key.expires)}>{getDateString(key.expires)}</hbox>
      </hbox>
      <hbox>
        <hbox class="label">{$t`ID`}</hbox>
        <hbox class="value">{key.id}</hbox>
      </hbox>
      <hbox>
        <hbox class="label">{$t`Cipher`}</hbox>
        <hbox class="value">DSA</hbox>
        <hbox class="label-2-column">{$t`Length`}</hbox>
        <hbox>{4096} {$t`bits`}</hbox>
      </hbox>
      <hbox class="verification-code">
        <hbox class="label">{$t`Verification code`}</hbox>
        <hbox class="value">{key.fingerprint}</hbox>
      </hbox>
      {#if !$key.obsolete}
        <hbox class="usage-detail">
          <hbox class="label">{$t`Usage`}</hbox>
          <vbox>
            <label>
              <input type="checkbox"
                bind:checked={key.useToEncrypt}
                disabled={$key.obsolete} />
              {$t`I want to receive encrypted emails`}
            </label>
            {#if $key.useToEncrypt}
              <div class="note">{$t`This is merely a request to your correspondents. The sender also needs to have encryption enabled for messages between you two to be encrypted.`}</div>
              <div class="warning note">{$t`Please save your private key, on a different device. If you lose the key, you will not be able to read your own encrypted emails anymore.`}</div>
              <div class="warning note">{$t`To read encrypted emails, you need to use ${appName} (or another app that supports ${key.system}) on your other devices as well.`}</div>
            {/if}
          </vbox>
        </hbox>
        {/if}
      <hbox class="obsolete-detail">
        <hbox class="label">{$t`Obsolete`}</hbox>
        <label>
          <input type="checkbox"
            bind:checked={key.obsolete} />
          {$t`Do not use this key for new messages`}
        </label>
      </hbox>
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
        <hbox class="label" />
        <hbox class="buttons">
          <Button
            label={$t`Export…`}
            onClick={onExport}
            />
          <Button
            label={$t`Delete`}
            icon={DeleteIcon}
            onClick={onDelete}
            />
        </hbox>
      </hbox>
    </vbox>
  {/if}
</vbox>

<script lang="ts">
  import { PublicKey } from "../../../../logic/Mail/Encryption/PublicKey";
  import RoundButton from "../../../Shared/RoundButton.svelte";
  import SignIcon from "lucide-svelte/icons/signature";
  import EncryptIcon from "lucide-svelte/icons/lock";
  import DistrustIcon from "lucide-svelte/icons/octagon-x";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import ChevronUp from "lucide-svelte/icons/chevron-up";
  import ChevronDown from "lucide-svelte/icons/chevron-down";
  import { appName } from "../../../../logic/build";
  import { getDateString, getDateTimeString } from "../../../Util/date";
  import { t } from "../../../../l10n/l10n";
  import Button from "../../../Shared/Button.svelte";

  export let key: PublicKey;

  let isExpanded = false;

  async function onExport() {
    // TODO
  }
  async function onDelete() {
    // TODO
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
    margin: 6px 24px 12px 48px;
  }
  .details > hbox {
    margin-block-end: 2px;
  }
  .details .label {
    min-width: 8em;
    margin-inline-end: 8px;
    flex-wrap: wrap;
  }
  .details .label-2-column {
    margin-inline-start: 32px;
    margin-inline-end: 8px;
  }
  .details label {
    display: flex;
    align-items: start;
  }
  .details label input[type=checkbox] {
    margin-inline-end: 8px;
  }
  .verification-code {
    margin-block: 12px;
  }
  .verification-code .label {
    padding-block: 7px;
  }
  .verification-code .value {
    background-color: var(--bg);
    color: var(--fg);

    padding: 8px 12px;
    font-weight: 500;
    letter-spacing: 0.05em;
  }
  .warning {
    background-color: yellow;
    color: darkred;
  }
  .note {
    padding: 6px 12px;
  }
  .usage-detail {
    padding-block-start: 24px;
    padding-block-end: 12px;
  }
  .obsolete-detail {
    padding-block: 6px;
  }
  .buttons {
    gap: 8px;
    margin-block-start: 8px;
    margin-block-end: 16px;
    width: 100%;
    justify-content: end;
  }
</style>
