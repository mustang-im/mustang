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
        <hbox>{$t`Public key certificate for ${key.system}`}</hbox>
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
      <hbox class="acceptance">
        <hbox class="label">{$t`Acceptance`}</hbox>
        <vbox>
          <label>
            <input type="radio"
              value={TrustLevel.Personal}
              bind:group={key.trustLevel} />
            {$t`I have personally checked that this key really belongs to ${person?.name ?? $t`this person`}`}
          </label>
          <label>
            <input type="radio"
              value={TrustLevel.ThirdParty}
              disabled={!key.caName}
              bind:group={key.trustLevel} />
            {key.caName
             ? $t`${key.caName} claims that this is correct`
             : $t`No known third-party verification`}
          </label>
          <label>
            <input type="radio"
              value={TrustLevel.Sender}
              bind:group={key.trustLevel} />
            {$t`Not checked`}
          </label>
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
        <label>
          <input type="checkbox"
            bind:checked={key.useToEncrypt}
            disabled={$key.trustLevel == TrustLevel.Distrusted} />
          {$t`Encrypt my emails to ${person.name} with this key`}
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
    </vbox>
  {/if}
</vbox>

<script lang="ts">
  import { PublicKey, trustColor, trustColorFG, TrustLevel } from "../../../logic/Mail/Encryption/PublicKey";
  import { Person } from "../../../logic/Abstract/Person";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import SignIcon from "lucide-svelte/icons/signature";
  import EncryptIcon from "lucide-svelte/icons/lock";
  import DistrustIcon from "lucide-svelte/icons/octagon-x";
  import ChevronUp from "lucide-svelte/icons/chevron-up";
  import ChevronDown from "lucide-svelte/icons/chevron-down";
  import { getDateString, getDateTimeString } from "../../Util/date";
  import { t } from "../../../l10n/l10n";

  export let key: PublicKey;
  export let person: Person;

  let isExpanded = false;
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
  .details label input[type=radio],
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
  .acceptance {
    padding-block: 16px;
  }
  .usage-detail {
    padding-block-end: 12px;
  }
</style>
