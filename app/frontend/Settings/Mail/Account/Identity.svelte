<vbox flex class="page">
  <PageHeader title="Identities" subtitle="This is how you appear to others when you send mail">
    <RoundButton
      label="Add"
      onClick={onAdd}
      icon={AddIcon}
      slot="buttons-top-right"
      />
  </PageHeader>

    <IdentityBlock identity={account} />
    {#each $identities.each as identity}
      <IdentityBlock {identity} />
    {/each}
</vbox>

<script lang="ts">
  import type { Account } from "../../../../logic/Abstract/Account";
  import type { MailAccount } from "../../../../logic/Mail/MailAccount";
  import { MailIdentity } from "../../../../logic/Mail/MailIdentity";
  import IdentityBlock from "./IdentityBlock.svelte";
  import RoundButton from "../../../Shared/RoundButton.svelte";
  import PageHeader from "../../Shared/PageHeader.svelte";
  import AddIcon from "lucide-svelte/icons/plus";

  export let account: Account;

  $: identities = (account as MailAccount).identities;
  $: console.log("identities", $identities.contents);

  function onAdd() {
    let id = new MailIdentity();
    id.userRealname = account.userRealname;
    identities.add(id);
  }
</script>

<style>
  .page {
    max-width: 40em;
  }
</style>
