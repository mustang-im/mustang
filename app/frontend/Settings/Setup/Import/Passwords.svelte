{#if account}
  <Header title={account.name} subtitle={account.emailAddress} />

  {#if account?.oAuth2}
    <Button label="Login" classes="primary"
      onClick={loginOAuth2}
      errorCallback={showError}
      disabled={oAuth2Succeeded}
      />
  {:else}
    <hbox>
      <label for="password">Password</label>
      <input type="password" name="password" bind:value={password} />
    </hbox>
  {/if}

  <hbox class="spacer1" flex />

  {#if validating}
    <StatusMessage status="processing"
      message="Verifying that the configuration works..." />
  {/if}
  {#if errorMessage}
    <ErrorMessage {errorMessage} errorGravity={ErrorGravity.Error} />
  {/if}

  <hbox class="spacer2" flex />

  <WorkspaceSelector config={account} />
{/if}

<ButtonsBottom
  canContinue={havePassword && !validating}
  on:continue={() => catchErrors(validateAccount, showError)}
  >
  <Button label="Back" classes="secondary"
    onClick={previousAccount}
    />
  <Button label="Skip" classes="secondary"
    onClick={nextAccount}
    />
</ButtonsBottom>

<script lang="ts">
  import type { MailAccount } from "../../../../logic/Mail/MailAccount";
  import { checkConfig } from "../../../../logic/Mail/AutoConfig/checkConfig";
  import WorkspaceSelector from "../Mail/WorkspaceSelector.svelte";
  import Header from "../Shared/Header.svelte";
  import StatusMessage from "../Shared/StatusMessage.svelte";
  import ErrorMessage, { ErrorGravity } from "../Shared/ErrorMessage.svelte";
  import ButtonsBottom from "../Shared/ButtonsBottom.svelte";
  import Button from "../../../Shared/Button.svelte";
  import { Cancelled } from "../../../../logic/util/Abortable";
  import { createEventDispatcher } from 'svelte';
  import { catchErrors } from "../../../Util/error";
  import { saveAndInitConfig } from "../../../../logic/Mail/AutoConfig/saveConfig";
  const dispatch = createEventDispatcher();

  export let accounts: MailAccount[] = [];

  let currentAccountIndex = 0;
  let account = accounts[0];
  let password = "";
  let oAuth2Succeeded = false;
  $: havePassword = password || oAuth2Succeeded;
  let validating = false;
  let validated = false;
  let errorMessage: string = null;
  $: console.log("account", account);
  resetForAccount();

  $: password, onPasswordChanged();
  function onPasswordChanged() {
    validated = false;
  }

  async function loginOAuth2() {
    await account.oAuth2.login(true);
    oAuth2Succeeded = true;
    await validateAccount();
  }

  async function validateAccount() {
    try {
      validating = true;
      await checkConfig(account, account.emailAddress, password);
    } finally {
      validating = false;
    }
    validated = true;
    await saveAndInitConfig(account, account.emailAddress, password);
    nextAccount();
  }

  function nextAccount() {
    account = accounts[++currentAccountIndex];
    if (currentAccountIndex >= accounts.length) {
      dispatch("continue");
      return;
    }
    resetForAccount();
  }

  function previousAccount() {
    account = accounts[--currentAccountIndex];
    if (currentAccountIndex < 0) {
      dispatch("back");
      return;
    }
    resetForAccount();
  }

  function resetForAccount() {
    errorMessage = null;
    validated = false;
    validating = false;
    password = null;
    oAuth2Succeeded = false;
  }

  function showError(ex: Error | string) {
    if (typeof (ex) == "string") {
      ex = new Error(ex);
    }
    if (ex instanceof Cancelled) {
      return;
    }
    console.error(ex);
    errorMessage = ex.message;
  }
</script>

<style>
  .spacer1,
  .spacer2 {
    min-height: 5vh;
  }
</style>
