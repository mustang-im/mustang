<GroupBox classes="encryption" headerName={$t`Encryption`} addFunc={() => showImportOverride = true}>
  <EcryptionIcon size="16px" slot="icon" />
  <hbox class="subtitle font-small">{$t`The encryption public keys allow you to send encrypted emails, and whether signed emails come from ${person.name}. Trust in the messages and encryption relies in your confidence that these keys really belong to ${person.name}.`}</hbox>
  <vbox class="encryption" slot="content">
    {#if showImport}
      <EncryptionImport {person} bind:isOpen={showImportOverride} />
    {/if}
    <vbox class="keys">
      {#each $keys.filterObservable(key => !key.obsolete).sortBy(key => key.sortOrder).each as key}
        <EncryptionKey {key} {person} />
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
              {$t`These below are certificates that are expired, revoked, or obsolete. They will not be used for new emails. They are still necessary to validate the signatures of previous emails that you have received and stored.`}
            </hbox>
          {/if}
        </vbox>
      {/if}
      {#if showObsolete}
        {#each keys.filterObservable(key => key.obsolete).each as key}
          <EncryptionKey {key} {person} />
        {/each}
      {/if}
    </vbox>
  </vbox>
</GroupBox>

<script lang="ts">
  import type { Person } from "../../../logic/Abstract/Person";
  import EncryptionKey from "./EncryptionKey.svelte";
  import GroupBox from "./GroupBox.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import EcryptionIcon from "lucide-svelte/icons/lock";
  import ChevronUp from "lucide-svelte/icons/chevron-up";
  import ChevronDown from "lucide-svelte/icons/chevron-down";
  import { t } from "../../../l10n/l10n";
  import EncryptionImport from "./EncryptionImport.svelte";

  export let person: Person;
  export let showImportOverride: boolean;

  $: keys = $person.encryptionPublicKeys;
  $: showImport = $keys.isEmpty || showImportOverride;
  let showObsolete = false;
</script>

<style>
  .encryption {
    align-items: center;
    margin-block-end: 4px;
  }
  .subtitle {
    opacity: 70%;
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
