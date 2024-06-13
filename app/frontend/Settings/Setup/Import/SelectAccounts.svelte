<Header
  title="Import accounts"
  subtitle="Continue to use your accounts from Thunderbird" />

{#await startImport()}
  <StatusMessage status="processing"
    message="Importing accounts..." />
{:then}
  <hbox class="found">Found {accounts.length} imported accounts</hbox>
  <vbox class="accounts">
    <Scroll>
      {#each accounts as account}
        <hbox>
          <Checkbox label={account.name} bind:checked={account.import} />
        </hbox>
      {/each}
    </Scroll>
  </vbox>
{:catch ex}
  {ex?.message ?? ex + ""}
{/await}
<ButtonsBottom
  canContinue={!!accounts.length}
  onContinue={onContinue}
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
  import Button from "../../../Shared/Button.svelte";
  import Header from "../Shared/Header.svelte";
  import Scroll from "../../../Shared/Scroll.svelte";

  export let accounts: MailAccount[] = [];
  export let onContinue = () => undefined;

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
</script>

<style>
  .found {
    justify-content: center;
    margin-bottom: 24px;
  }
  .accounts {
    min-height: 30vh;
  }
</style>
