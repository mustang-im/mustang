{#if step == Step.MoreAccounts}
  <SetupMail />
{:else}
  <vbox flex class="import-window">
    <hbox flex />
    <vbox class="page-box">
      {#if step == Step.SelectAccounts}
        <SelectAccounts bind:accounts={accountCandidates} on:continue={onSelectAccountsContinue} />
      {:else if step == Step.Passwords}
        <Passwords {accounts} on:continue={onPasswordContinue} on:back={onPasswordBack} />
      {/if}
    </vbox>
    <hbox flex />
    <BackgroundVideo />
  </vbox>
{/if}

<script lang="ts">
  import type { MailAccount } from "../../../../logic/Mail/MailAccount";
  import SelectAccounts from "./SelectAccounts.svelte";
  import BackgroundVideo from "../Shared/BackgroundVideo.svelte";
  import { createEventDispatcher } from 'svelte';
  import Passwords from "./Passwords.svelte";
  import SetupMail from "../Mail/SetupMail.svelte";
  const dispatch = createEventDispatcher();

  let accountCandidates: MailAccount[];
  let accounts: MailAccount[];

  enum Step {
    SelectAccounts = 1,
    Passwords = 2,
    MoreAccounts = 3,
  }
  let step: Step = Step.SelectAccounts;

  function onSelectAccountsContinue() {
    accounts = accountCandidates.filter(acc => (acc as any).import);
    step = accounts.length ? Step.Passwords : Step.MoreAccounts;
  }

  function onPasswordContinue() {
    step = Step.MoreAccounts;
  }

  function onPasswordBack() {
    accountCandidates = [];
    step = Step.SelectAccounts;
  }

  function onCancel() {
    dispatch("cancel");
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
