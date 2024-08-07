<Header
  title={$t`Import accounts`}
  subtitle={$t`Continue to use your accounts from Thunderbird`} />

{#await startImport()}
  <StatusMessage status="processing"
    message={$t`Importing accounts...`} />
{:then}
  <hbox class="found">{$t`Found ${accounts.length} imported accounts`}</hbox>
  <vbox class="accounts">
    <Scroll>
      <grid class="protocol-grid">
        {#each accounts as account}
          <Checkbox label={account.name} bind:checked={account.import} />
          <hbox class="protocol">{account.protocol.toUpperCase()}</hbox>
        {/each}
      </grid>
    </Scroll>
  </vbox>
{:catch ex}
  {ex?.message ?? ex + ""}
{/await}
<ButtonsBottom
  canContinue={!!accounts.length}
  onContinue={onContinue}
  >
  <Button label={$t`Skip`} classes="secondary"
    onClick={onSkip}
    />
  <Button label={$t`Uncheck all`} classes="secondary"
    onClick={onUncheckAll}
    />
</ButtonsBottom>

<script lang="ts">
  import { ThunderbirdProfile } from "../../../../logic/Mail/Import/Thunderbird/TBProfile";
  import type { MailAccount } from "../../../../logic/Mail/MailAccount";
  import { IMAPAccount } from "../../../../logic/Mail/IMAP/IMAPAccount";
  import { EWSAccount } from "../../../../logic/Mail/EWS/EWSAccount";
  import { OWAAccount } from "../../../../logic/Mail/OWA/OWAAccount";
  import StatusMessage from "../Shared/StatusMessage.svelte";
  import ButtonsBottom from "../Shared/ButtonsBottom.svelte";
  import Checkbox from "../../../Shared/Checkbox.svelte";
  import Button from "../../../Shared/Button.svelte";
  import Header from "../Shared/Header.svelte";
  import Scroll from "../../../Shared/Scroll.svelte";
  import { t } from "../../../../l10n/l10n";

  export let accounts: MailAccount[] = [];
  export let onContinue = () => undefined;

  async function startImport() {
    let profiles = await ThunderbirdProfile.findProfiles();
    if (profiles.length) {
      for (let profile of profiles.filter(p => p.name && !p.name.toLowerCase().includes("test"))) {
        try {
          let tbAccounts = await profile.readMailAccounts();
          accounts = accounts.concat(tbAccounts);
        } catch (ex) {
          console.log(ex?.message);
        }
      }
    }

    // POP3, ActiveSync not yet supported
    accounts = accounts.filter(acc => acc instanceof IMAPAccount || acc instanceof EWSAccount || acc instanceof OWAAccount);

    for (let account of accounts) {
      (account as any).import = true;
    }

    console.log("Imported accounts", accounts);
    if (!accounts.length) {
      onContinue();
      return;
    }
  }

  function onUncheckAll() {
    for (let account of accounts) {
      (account as any).import = false;
    }
    accounts = accounts;
  }

  function onSkip() {
    onUncheckAll();
    onContinue();
  }
</script>

<style>
  .found {
    justify-content: center;
    margin-block-end: 24px;
  }
  .accounts {
    min-height: 30vh;
  }
  grid.protocol-grid {
    grid-template-columns: auto max-content;
    margin: 4px 12px;
  }
  .protocol {
    margin-inline-start: 16px;
  }
</style>
