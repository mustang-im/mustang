{#if $privateKeys.hasItems}
  {#if $recipientsWithoutKeys.hasItems}
    <vbox class="no-keys">
      <hbox class="all box">
        <div class="explanation">{$t`To encrypt this message, add certificates for the following recipients`}</div>
        <hbox flex />
        <hbox class="buttons">
          <Button
            label={$t`Query key servers`}
            icon={QueryServerIcon}
            onClick={onQueryKeyServer}
            />
          <Button
            label={$t`Remove recipients`}
            icon={RemoveAllIcon}
            onClick={onRemoveAll}
            />
        </hbox>
      </hbox>
      <hbox class="recipients">
        {#each $recipientsWithoutKeys.each as recipient}
          <vbox class="recipient box">
            <hbox class="first-row">
              <Recipient {recipient} />
              <Button
                label={$t`Remove`}
                icon={RemoveOneIcon}
                onClick={() => onRemoveOne(recipient)}
                />
            </hbox>
            <EncryptionImport person={recipient.createPerson(appGlobal.collectedAddressbook)} isOpen={true} />
          </vbox>
        {/each}
      </hbox>
    </vbox>
  {/if}
{/if}

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import { MailIdentity } from "../../../logic/Mail/MailIdentity";
  import type { PersonUID } from "../../../logic/Abstract/PersonUID";
  import { appGlobal } from "../../../logic/app";
  import EncryptionImport from "../../Contacts/PersonPage/EncryptionImport.svelte";
  import Recipient from "../Message/Recipient.svelte";
  import Button from "../../Shared/Button.svelte";
  import QueryServerIcon from "lucide-svelte/icons/cloud-download";
  import RemoveAllIcon from "lucide-svelte/icons/trash-2";
  import RemoveOneIcon from "lucide-svelte/icons/trash-2";
  import { t } from "../../../l10n/l10n";

  export let mail: EMail;
  export let identity: MailIdentity;

  $: privateKeys = identity.encryptionPrivateKeys;
  let allRecipients = mail.to.concat(mail.cc).concat(mail.bcc);
  // TODO Observer `encryptionPublicKeys`
  let recipientsWithoutKeys = $allRecipients.filterObservable(p => !p.findPerson()?.encryptionPublicKeys.find(key => key.system == mail.system));

  $: console.log("all", $allRecipients.contents.join(", "), $allRecipients.contents, "without keys", $recipientsWithoutKeys.contents);

  async function onQueryKeyServer() {
    await Promise.all(recipientsWithoutKeys.contents.map(recipient =>
      queryKeyServerPGP(recipient)));
  }

  async function queryKeyServerPGP(recipient: PersonUID) {
  }

  function onRemoveAll() {
    mail.to.removeAll(recipientsWithoutKeys);
    mail.cc.removeAll(recipientsWithoutKeys);
    mail.bcc.removeAll(recipientsWithoutKeys);
  }

  function onRemoveOne(recipient: PersonUID) {
    mail.to.remove(recipient);
    mail.cc.remove(recipient);
    mail.bcc.remove(recipient);
  }
</script>

<style>
  .box {
    background-color: var(--main-pattern-bg);
    color: var(--main-pattern-fg);
    border-radius: 2px;
    box-shadow: 1px 1px 1px 0px rgba(0, 0, 0, 15%);
    margin: 4px 0px;
    padding: 6px 16px;
  }
  .all {
    flex-wrap: wrap;
    align-items: center;
  }
  .recipients {
    flex-wrap: wrap;
    gap: 8px;
    margin-block-end: 16px;
  }
  .recipient :global(.key-import) {
    box-shadow: none;
    margin-block-end: -4px;
  }
  .recipient :global(.button.close),
  .recipient :global(.button.keyserver) {
    display: none;
  }
  .recipient .first-row {
    align-items: center;
    gap: 16px;
    margin-block-start: 8px;
    margin-inline-start: 16px;
  }
  .buttons {
    align-items: baseline;
    justify-items: end;
    gap: 12px;
  }
</style>
