<vbox class="encryption">
  <hbox class="header" flex>
    <hbox class="title">{$t`Encryption`}</hbox>
    <hbox flex />
    <hbox class="buttons">
      <RoundButton
        label={$t`Import or Create new…`}
        icon={PlusIcon}
        onClick={() => showCreate = true}
        border={false}
        classes="plain"
        />
    </hbox>
  </hbox>
  <hbox class="subtitle font-small">{$t`Private keys allow you to send encrypted emails, and to sign your own emails.`}</hbox>
  <vbox class="keys">
    {#if showCreate || showCreateOverride}
      <EncryptionImport {identity} bind:isOpen={showCreateOverride} bind:showObsolete />
    {/if}
    {#each $keys.filterObservable(key => !key.obsolete).sortBy(key => key.sortOrder).each as key}
      <EncryptionKey {key} {identity} />
    {/each}
    {#if $keys.filterObservable(key => key.obsolete).hasItems}
      <vbox class="expired-header"
        class:expanded={showObsolete}
        on:click={() => showObsolete = !showObsolete}>
        <hbox class="first-row">
          <hbox class="label font-smallest" flex>
            {$t`Expired`}
          </hbox>
          <RoundButton
            label={showObsolete ? $t`Collapse` : $t`Expand`}
            icon={showObsolete ? ChevronUp : ChevronDown}
            border={false}
            classes="plain"
            />
        </hbox>
        {#if showObsolete}
          <hbox class="subtitle font-smallest" flex>
            {$t`These below are your keys that are expired, revoked, or obsolete. They will not be used for new emails. They are still necessary to read old emails that you have received and stored.`}
          </hbox>
        {/if}
      </vbox>
    {/if}
    {#if showObsolete}
      {#each $keys.filterObservable(key => key.obsolete).each as key}
        <EncryptionKey {key} {identity} />
      {/each}
    {/if}
  </vbox>
</vbox>

<script lang="ts">
  import { MailIdentity } from "../../../../logic/Mail/MailIdentity";
  import EncryptionKey from "./EncryptionKey.svelte";
  import RoundButton from "../../../Shared/RoundButton.svelte";
  import PlusIcon from "lucide-svelte/icons/plus";
  import ChevronUp from "lucide-svelte/icons/chevron-up";
  import ChevronDown from "lucide-svelte/icons/chevron-down";
  import { t } from "../../../../l10n/l10n";
  import EncryptionImport from "./EncryptionImport.svelte";

  export let identity: MailIdentity;
  export let showCreateOverride: boolean;

  $: keys = identity.encryptionPrivateKeys;
  $: showCreate = $keys.isEmpty;
  let showObsolete = false;

  $: console.log("override", showCreateOverride, "empty", showCreate, "show", showCreateOverride || showCreate);
</script>

<style>
  .encryption {
    align-items: start;
    margin-block-start: 24px;
    margin-block-end: 4px;
    flex-wrap: wrap;
  }
  .header {
    align-items: center;
    width: 100%;
  }
  .header .buttons {
    gap: 12px;
    align-items: center;
  }
  .subtitle {
    opacity: 70%;
  }
  .keys {
    margin-block-start: 16px;
    align-self: center;
    width: 100%;
  }
  .expired-header {
    padding: 0px 8px;
  }
  .expired-header.expanded {
    margin-block-start: 4px;
  }
  .expired-header .label {
    opacity: 50%;
    justify-content: center;
    align-items: center;
  }
  .expired-header .first-row:hover {
    background-color: var(--hover-bg);
    color: var(--hover-fg);
  }
</style>
