<vbox class="encryption">
  <hbox class="header">
    <hbox class="title">{$t`Encryption`}</hbox>
  </hbox>
  <hbox class="subtitle font-smallest">{$t`Private keys allow you to send encrypted emails, and to sign your own emails.`}</hbox>
  <vbox class="keys">
    {#each $keys.filterObservable(key => !key.obsolete).each as key}
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
  <hbox class="buttons" flex>
    <Button
      label={$t`Import from file…`}
      icon={ImportFileIcon}
      onClick={onImportFile}
      />
    <Button
      label={$t`Create new…`}
      icon={PlusIcon}
      onClick={onCreateNew}
      />
  </hbox>
</vbox>

<script lang="ts">
  import { MailIdentity } from "../../../../logic/Mail/MailIdentity";
  import { type PublicKey, type PrivateKey, TrustLevel } from "../../../../logic/Mail/Encryption/PublicKey";
  import { PGPPrivateKey } from "../../../../logic/Mail/Encryption/PGP/PGPPrivateKey";
  import { SMIMEPrivateKey } from "../../../../logic/Mail/Encryption/SMIME/SMIMEPrivateKey";
  import EncryptionKey from "./EncryptionKey.svelte";
  import Button from "../../../Shared/Button.svelte";
  import RoundButton from "../../../Shared/RoundButton.svelte";
  import EcryptionIcon from "lucide-svelte/icons/lock";
  import ImportFileIcon from "lucide-svelte/icons/file-lock";
  import PlusIcon from "lucide-svelte/icons/plus";
  import ChevronUp from "lucide-svelte/icons/chevron-up";
  import ChevronDown from "lucide-svelte/icons/chevron-down";
  import { ArrayColl } from "svelte-collections";
  import { t } from "../../../../l10n/l10n";

  export let identity: MailIdentity;

  let showObsolete = false;

  $: keys = identity.encryptionPrivateKeys;

  for (let i = 0; i < 5; i++) {
    //makeKey();
  }

  function makeKey(): PublicKey {
    let key = Math.random() > 0.5 ? new PGPPrivateKey() : new SMIMEPrivateKey();
    key.obsolete = Math.random() > 0.2;
    key.useToEncrypt = Math.random() > 0.5;
    if (Math.random() < 0.2) {
      key.trustLevel = TrustLevel.Personal;
    }
    key.userIDs.add(identity.emailAddress);
    keys.add(key);
    return key;
  }

  async function onImportFile() {
    makeKey().obsolete = false;
  }

  async function onCreateNew() {
    makeKey().obsolete = false;
  }
</script>

<style>
  .encryption {
    align-items: start;
    margin-block-end: 4px;
    flex-wrap: wrap;
  }
  .header {
    justify-content: start;
    align-items: center;
    margin-block-start: 24px;
  }
  .subtitle {
    opacity: 70%;
  }
  .keys {
    margin-block-start: 16px;
    align-self: center;
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
  .buttons {
    gap: 12px;
    margin-block-start: 24px;
  }
</style>
