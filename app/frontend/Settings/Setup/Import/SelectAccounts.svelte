<Header
  title="Import accounts"
  subtitle="Continue to use your accounts from Thunderbird" />

{#await startImport()}
  <StatusMessage status="processing"
    message="Importing accounts..." />
{:then}
  Found {accounts.length} imported accounts
  {#each accounts as account}
    <hbox>
      <Checkbox label={account.name} bind:checked={account.import} />
    </hbox>
  {/each}
{:catch ex}
  {ex?.message ?? ex + ""}
{/await}
<ButtonsBottom
  canContinue={!!accounts.length}
  on:continue={() => catchErrors(onContinue)}
  >
  <Button label="Skip" classes="secondary"
    onClick={onSkip}
    />
</ButtonsBottom>

<script lang="ts">
  import { ThunderbirdProfile } from "../../../../logic/Mail/Import/Thunderbird/TBProfile";
  import type { MailAccount } from "../../../../logic/Mail/MailAccount";
  import StatusMessage from "../Shared/StatusMessage.svelte";
  import ButtonsBottom from "../Shared/ButtonsBottom.svelte";
  import Checkbox from "../../../Shared/Checkbox.svelte";
  import { catchErrors } from "../../../Util/error";
  import { createEventDispatcher } from 'svelte';
  import Button from "../../../Shared/Button.svelte";
  import Header from "../Shared/Header.svelte";
  const dispatch = createEventDispatcher();

  export let accounts: MailAccount[] = [];

  $: console.log("accounts", accounts);

  async function startImport() {
    console.log("scaning");
    let profiles = await ThunderbirdProfile.findProfiles();
    if (profiles.length) {
      for (let profile of profiles.filter(p => p.name && !p.name.includes("Test"))) {
        try {
          let tbAccounts = await profile.readMailAccounts();
          accounts = accounts.concat(tbAccounts);
        } catch (ex) {
          console.log(ex?.message);
        }
      }
    }
    for (let account of accounts) {
      (account as any).import = true;
    }

    console.log("scan finished", accounts);
    if (!accounts.length) {
      console.log("no accounts found");
      onContinue();
      return;
    }
  }

  function onSkip() {
    for (let account of accounts) {
      (account as any).import = false;
    }
    onContinue();
  }

  function onContinue() {
    dispatch("continue");
  }
</script>

<style>
</style>
