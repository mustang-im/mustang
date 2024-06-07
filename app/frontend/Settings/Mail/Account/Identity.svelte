<vbox flex class="page">
  <PageHeader title="Identities" subtitle="This is how you appear to others when you send mail">
    <RoundButton
      label="Add"
      onClick={onAdd}
      icon={AddIcon}
      slot="buttons-top-right"
      />
  </PageHeader>

  <IdentityBlock identity={account} canRemove={false} />
  {#each $identities.each as identity}
    <IdentityBlock {identity}
      canRemove={$identities.length > 1}
      on:delete={event => catchErrors(() => onDelete(event.detail))}
      />
  {/each}

  <hbox class="buttons">
    <Button label="Save"
      classes="save"
      icon={SaveIcon}
      onClick={onSave}
      />
  </hbox>
</vbox>

<script lang="ts">
  import type { Account } from "../../../../logic/Abstract/Account";
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

  export let account: Account;

  $: identities = (account as MailAccount).identities;
  $: console.log("identities", $identities.contents);

  function onAdd() {
    let id = new MailIdentity();
    id.userRealname = account.userRealname;
    identities.add(id);
  }
  async function onDelete(identity) {
    assert(identities.length > 1, "Cannot remove the last identity");
    identities.remove(identity);
    await account.save();
  }
  async function onSave() {
    await account.save();
  }
</script>

<style>
  .page {
    max-width: 40em;
  }
  .buttons {
    justify-content: end;
    margin-top: 64px;
  }
  .buttons :global(button) {
    margin-left: 8px;
  }
</style>
