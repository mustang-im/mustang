<vbox flex class="import-window">
  <hbox flex />
  <vbox class="page-box">
    {#if step == Step.SelectAccounts}
      <SelectAccounts bind:accounts={accountCandidates} onContinue={onSelectAccountsContinue} />
    {:else if step == Step.Password}
      <Password {account} onContinue={onPasswordContinue} onBack={onPasswordBack} onSkip={onAccountSkip} />
    {:else if step == Step.FinalizeAccount}
      <FinalizeAccount {account} onContinue={onFinalizeContinue} onBack={onFinalizeBack} />
    {/if}
  </vbox>
  <hbox flex />
  <BackgroundVideo />
</vbox>

<script lang="ts">
  import type { MailAccount } from "../../../../logic/Mail/MailAccount";
  import SelectAccounts from "./SelectAccounts.svelte";
  import Password from "./Password.svelte";
  import FinalizeAccount from "./FinalizeAccount.svelte";
  import BackgroundVideo from "../Shared/BackgroundVideo.svelte";

  export let onContinue = () => undefined;
  export let onCancel = () => undefined;

  let accountCandidates: MailAccount[];
  let accounts: MailAccount[];
  let account: MailAccount;
  let currentAccountIndex = 0;

  enum Step {
    SelectAccounts = 1,
    Password = 2,
    FinalizeAccount = 3,
  }
  let step: Step = Step.SelectAccounts;

  function onSelectAccountsContinue() {
    accounts = accountCandidates.filter(acc => (acc as any).import);
    if (accounts.length) {
      currentAccountIndex = 0;
      account = accounts[currentAccountIndex];
      step = Step.Password;
    } else {
      onCancel();
    }
  }

  function onBackToAccountsList() {
    accountCandidates = [];
    step = Step.SelectAccounts;
  }

  function onAccountSkip() {
    nextAccount();
  }

  function onPasswordBack() {
    previousAccount();
  }

  function onPasswordContinue() {
    step = Step.FinalizeAccount;
  }

  function onFinalizeBack() {
    step = Step.Password;
  }

  function onFinalizeContinue() {
    nextAccount();
  }

  function nextAccount() {
    if (++currentAccountIndex >= accounts.length) {
      onContinue();
      return;
    }
    account = accounts[currentAccountIndex];
    step = Step.Password;
  }

  function previousAccount() {
    if (--currentAccountIndex < 0) {
      onBackToAccountsList();
      return;
    }
    account = accounts[currentAccountIndex];
    step = Step.Password;
  }
</script>

<style>
  .import-window {
    justify-content: center;
    align-items: center;
  }
  .page-box {
    max-width: 32em;
    padding: 24px 48px 20px 48px;
    background-color: var(--main-bg);
    color: var(--main-fg);
  }
</style>
