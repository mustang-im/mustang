<vbox flex class="import-window">
  <hbox flex />
  <vbox class="page-box">
    {#if step == Step.SelectAccounts}
      <SelectAccounts bind:accounts={accountCandidates} onContinue={onSelectAccountsContinue} />
    {:else if step == Step.Login}
      <LoginPage {account} onContinue={onPasswordContinue} onBack={onPasswordBack} onSkip={onAccountSkip} />
    {:else if step == Step.FinalizeAccount}
      <FinalizeAccount {account} onContinue={onFinalizeContinue} onBack={onFinalizeBack} />
    {:else if step == Step.SelectAddressBooks}
      <SelectAddressbooks onContinue={onAddressbooksContinue} />
    {:else if step == Step.Done}
      <SetupAnyAccountType onContinue={onClose} />
    {/if}
  </vbox>
  <hbox flex />
  <BackgroundVideo />
</vbox>

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import { openApp } from "../../AppsBar/selectedApp";
  import { mailMustangApp } from "../../Mail/MailMustangApp";
  import SelectAccounts from "./SelectAccounts.svelte";
  import LoginPage from "./LoginPage.svelte";
  import FinalizeAccount from "./FinalizeAccount.svelte";
  import BackgroundVideo from "../Shared/BackgroundVideo.svelte";
  import SelectAddressbooks from "./SelectAddressbooks.svelte";
  import SetupAnyAccountType from "../SetupAnyAccountType.svelte";

  let accountCandidates: MailAccount[];
  let accounts: MailAccount[];
  let account: MailAccount;
  let currentAccountIndex = 0;

  enum Step {
    SelectAccounts = 1,
    Login = 2,
    FinalizeAccount = 3,
    SelectAddressBooks = 4,
    Done = 5,
  }
  let step: Step = Step.SelectAccounts;

  function onSelectAccountsContinue() {
    accounts = accountCandidates.filter(acc => (acc as any).import);
    if (accounts.length) {
      currentAccountIndex = 0;
      account = accounts[currentAccountIndex];
      step = Step.Login;
    } else {
      step = Step.SelectAddressBooks;
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
    step = Step.Login;
  }

  function onFinalizeContinue() {
    nextAccount();
  }

  function onAddressbooksContinue() {
    step = Step.Done;
  }

  function onClose() {
    openApp(mailMustangApp, {});
  }

  function nextAccount() {
    if (++currentAccountIndex >= accounts.length) {
      step = Step.SelectAddressBooks;
      return;
    }
    account = accounts[currentAccountIndex];
    step = Step.Login;
  }

  function previousAccount() {
    if (--currentAccountIndex < 0) {
      onBackToAccountsList();
      return;
    }
    account = accounts[currentAccountIndex];
    step = Step.Login;
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
  :global(.mobile) .page-box {
    padding: 12px 24px;
  }
</style>
