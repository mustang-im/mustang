<GroupBox classes="encryption" headerName={$t`Encryption`}>
  <EcryptionIcon size="16px" slot="icon" />
  <hbox class="subtitle font-smallest">{$t`The encryption public keys allow you to send encrypted emails, and whether signed emails come from ${person.name}. Trust in the messages and encryption relies in your confidence that these keys really belong to ${person.name}.`}</hbox>
  <vbox class="encryption" slot="content">
    <vbox class="keys">
      {#each $keys.filterObservable(key => !key.obsolete).each as key}
        <EncryptionKey {key} {person} />
      {/each}
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
            {$t`These below are certificates that are expired, revoked, or obsolete. They will not be used for new emails. They are still are necessary to validate the signatures of previous emails that you have received and stored.`}
          </hbox>
        {/if}
      </vbox>
      {#if showObsolete}
        {#each $keys.filterObservable(key => key.obsolete).each as key}
          <EncryptionKey {key} {person} />
        {/each}
      {/if}
    </vbox>
    {#if isEditing}
      <hbox class="buttons">
        <Button
          label={$t`Import from file…`}
          icon={ImportFileIcon}
          onClick={onImportFile}
          />
        <Button
          label={$t`Query keyservers`}
          icon={KeyserverIcon}
          onClick={onQueryKeyservers}
          />
      </hbox>
    {/if}
  </vbox>
</GroupBox>

<script lang="ts">
  import type { Person } from "../../../logic/Abstract/Person";
  import { EncryptionSystem, PublicKey, TrustLevel } from "../../../logic/Mail/Encryption/PublicKey";
  import EncryptionKey from "./EncryptionKey.svelte";
  import GroupBox from "./GroupBox.svelte";
  import Button from "../../Shared/Button.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import EcryptionIcon from "lucide-svelte/icons/lock";
  import ImportFileIcon from "lucide-svelte/icons/file-lock";
  import KeyserverIcon from "lucide-svelte/icons/cloud-download";
  import ChevronUp from "lucide-svelte/icons/chevron-up";
  import ChevronDown from "lucide-svelte/icons/chevron-down";
  import { ArrayColl } from "svelte-collections";
  import { t } from "../../../l10n/l10n";

  export let person: Person;
  export let isEditing: boolean;

  let showObsolete = false;

  let keys = new ArrayColl<PublicKey>();
  for (let i = 0; i < 10; i++) {
    makeKey();
  }

  function makeKey(): PublicKey {
    let system = Math.random() > 0.5 ? EncryptionSystem.PGP : EncryptionSystem.SMIME;
    let key = new PublicKey(system);
    key.obsolete = Math.random() > 0.2;
    key.useToEncrypt = Math.random() > 0.5;
    if (Math.random() < 0.2) {
      key.trustLevel = TrustLevel.Personal;
    }
    console.log("mails", person.emailAddresses.contents)
    for (let contact of person.emailAddresses) {
      key.userIDs.add(contact.value);
    }
    keys.add(key);
    return key;
  }

  async function onImportFile() {
  }

  async function onQueryKeyservers() {
    while (Math.random() < 0.5) {
      makeKey().obsolete = false;
    }
  }
</script>

<style>
  .encryption {
    align-items: center;
    margin-block-end: 4px;
    flex-wrap: wrap;
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
