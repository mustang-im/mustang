<vbox flex class="import-window">
  <hbox flex />
  <vbox class="page-box">
    {#if step == Step.SelectAccounts}
      <SelectAccounts bind:accounts={accountCandidates} onContinue={onSelectAccountsContinue} />
    {:else if step == Step.Passwords}
      <Passwords {accounts} onContinue={onContinue} onBack={onPasswordBack} />
    {/if}
  </vbox>
  <hbox flex />
  <BackgroundVideo />
</vbox>

<script lang="ts">
  import type { MailAccount } from "../../../../logic/Mail/MailAccount";
  import SelectAccounts from "./SelectAccounts.svelte";
  import BackgroundVideo from "../Shared/BackgroundVideo.svelte";
  import Passwords from "./Passwords.svelte";

  export let onContinue = () => undefined;
  export let onCancel = () => undefined;

  let accountCandidates: MailAccount[];
  let accounts: MailAccount[];

  enum Step {
    SelectAccounts = 1,
    Passwords = 2,
  }
  let step: Step = Step.SelectAccounts;

  function onSelectAccountsContinue() {
    accounts = accountCandidates.filter(acc => (acc as any).import);
    if (accounts.length) {
      step = Step.Passwords;
    } else {
      onCancel();
    }
  }

  function onPasswordBack() {
    accountCandidates = [];
    step = Step.SelectAccounts;
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
