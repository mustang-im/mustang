<vbox flex class="page">
  <PageHeader title={$t`Identities`} subtitle={$t`This is how you appear to others when you send mail`}>
    <RoundButton
      label={$t`Add`}
      onClick={onAdd}
      icon={AddIcon}
      slot="buttons-top-right"
      />
  </PageHeader>

  {#each $identities.each as identity}
    <IdentityBlock {identity}
      canRemove={$identities.length > 1}
      on:delete={event => catchErrors(() => onDelete(event.detail))}
      />
  {/each}

  <hbox class="buttons">
    <Button label={$t`Save`}
      classes="save"
      icon={SaveIcon}
      onClick={onSave}
      />
  </hbox>
</vbox>

<script lang="ts">
  import type { MailAccount } from "../../../../logic/Mail/MailAccount";
  import { MailIdentity } from "../../../../logic/Mail/MailIdentity";
  import IdentityBlock from "./IdentityBlock.svelte";
  import PageHeader from "../../Shared/PageHeader.svelte";
  import RoundButton from "../../../Shared/RoundButton.svelte";
  import Button from "../../../Shared/Button.svelte";
  import AddIcon from "lucide-svelte/icons/plus";
  import SaveIcon from "lucide-svelte/icons/save";
  import { assert } from "../../../../logic/util/util";
  import { catchErrors } from "../../../Util/error";
  import { t } from "../../../../l10n/l10n";

  export let account: MailAccount;

  $: identities = (account as MailAccount).identities;
  $: console.log("identities", $identities.contents);

  function onAdd() {
    let id = new MailIdentity(account);
    id.realname = account.realname;
    identities.add(id);
  }
  async function onDelete(identity) {
    assert(identities.length > 1, $t`Cannot remove the last identity`);
    identities.remove(identity);
    await account.save();
  }
  async function onSave() {
    assert(identities.hasItems, $t`Need at least 1 identity`);
    account.emailAddress = identities.first.emailAddress;
    account.realname = identities.first.realname;
    await account.save();
  }
</script>

<style>
  .page {
    max-width: 40em;
  }
  .buttons {
    justify-content: end;
    margin-block-start: 64px;
  }
  .buttons :global(button) {
    margin-inline-start: 8px;
  }
</style>
