<vbox class="key" class:obsolete={$key.obsolete}>
  <hbox class="main-row"
    on:click={() => isExpanded = !isExpanded}>
    <hbox class="usage"
      style:background-color={trustColor[$key.trustLevel] ?? "grey"}
      style:color={trustColorFG[$key.trustLevel] ?? "black"}>
      {#if $key.trustLevel == TrustLevel.Distrusted}
        <DistrustIcon title={$t`Untrusted`} size="16px" />
      {:else if $key.useToEncrypt}
        <EncryptIcon title={$t`Use for encryption and checking signatures`} size="16px" />
      {:else}
        <SignIcon title={$t`Use only for checking signatures`} size="16px" />
      {/if}
    </hbox>
    <hbox class="name">{$key.name}</hbox>
    {#if isExpanded}
      <hbox class="keytype" flex>{$t`Public key certificate`}</hbox>
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
      <hbox class="acceptance">
        <hbox class="label">{$t`Acceptance`}</hbox>
        <vbox>
          <label>
            <input type="radio"
              value={TrustLevel.Personal}
              bind:group={key.trustLevel} />
            {$t`I have personally checked that this key really belongs to ${person?.name ?? $t`this person`}`}
          </label>
          {#if key.caName}
            <label>
              <input type="radio"
                value={TrustLevel.ThirdParty}
                disabled={!key.caName}
                bind:group={key.trustLevel} />
              {`${key.caName} claims that this is correct`}
            </label>
          {:else}
            <label>
              <input type="radio"
                value={TrustLevel.Sender}
                bind:group={key.trustLevel} />
              {$t`Not checked`}
            </label>
          {/if}
          <label>
            <input type="radio"
              value={TrustLevel.Distrusted}
              bind:group={key.trustLevel} />
            {$t`This key is bad`}
          </label>
        </vbox>
      </hbox>
      <hbox class="usage-detail">
        <hbox class="label">{$t`Usage`}</hbox>
        <Checkbox toggle
          bind:checked={key.useToEncrypt}
          disabled={$key.trustLevel == TrustLevel.Distrusted}
          label={$t`Encrypt my emails to ${person.name} with this key`} />
      </hbox>
      <hbox class="verification-code">
        <hbox class="label">{$t`Verification code`}</hbox>
        <hbox class="value">{key.fingerprint}</hbox>
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
            icon={ExportIcon}
            onClick={onExport}
            />
          <RoundButton
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
  import { PublicKey, trustColor, trustColorFG, TrustLevel } from "../../../logic/Mail/Encryption/PublicKey";
  import { Person } from "../../../logic/Abstract/Person";
  import Checkbox from "../../Shared/Checkbox.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import Button from "../../Shared/Button.svelte";
  import SignIcon from "lucide-svelte/icons/signature";
  import EncryptIcon from "lucide-svelte/icons/lock";
  import DistrustIcon from "lucide-svelte/icons/octagon-x";
  import ExportIcon from "lucide-svelte/icons/file-down";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import ChevronUp from "lucide-svelte/icons/chevron-up";
  import ChevronDown from "lucide-svelte/icons/chevron-down";
  import { getDateString, getDateTimeString } from "../../Util/date";
  import { t } from "../../../l10n/l10n";

  export let key: PublicKey;
  export let person: Person;

  let isExpanded = false;

  async function onExport() {
    alert("TODO Export…");
    // TODO
  }
  async function onDelete() {
    if (!confirm(`Do you want to delete this public key for ${person.name}? You will not be able to validate emails signed with this key.`)) {
      return;
    }
    person.encryptionPublicKeys.remove(key);
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
  .details > hbox {
    margin-block-end: 2px;
  }
  .details .label {
    min-width: 8em;
    flex-wrap: wrap;
    margin-inline-end: 8px;
    opacity: 65%;
  }
  .details .label-2-column {
    margin-inline-start: 32px;
    margin-inline-end: 8px;
    opacity: 65%;
  }
  .details label {
    display: flex;
    align-items: start;
  }
  .details label input[type=radio] {
    margin-inline-end: 8px;
  }
  .verification-code:not(.obsolete) {
    margin-block: 20px;
  }
  .verification-code .label {
    padding-block: 7px;
  }
  .verification-code .value {
    letter-spacing: 0.05em;
    padding-block: 8px;
  }
  .verification-code:not(.obsolete) .value {
    background-color: var(--bg);
    color: var(--fg);

    font-weight: 500;
    padding-inline: 12px;
  }
  .acceptance {
    padding-block: 4px;
  }
  .usage-detail {
    padding-block-start: 8px;
  }
  .buttons {
    gap: 8px;
    margin-block-start: 8px;
    margin-block-end: 16px;
    width: 100%;
    justify-content: end;
  }
</style>
