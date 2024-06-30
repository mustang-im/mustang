{#if account}
  <Header title={account.name} subtitle={account.emailAddress} />

  {#if account?.oAuth2}
    <hbox class="buttons login">
      <Button label={$t`Login`}
        classes="filled large"
        onClick={loginOAuth2}
        errorCallback={showError}
        disabled={oAuth2Succeeded}
        />
    </hbox>
  {:else}
    <hbox class="password-row">
      <label for="password">{$t`Password`}</label>
      <Password bind:password
        autofocus={true}
        on:continue={() => catchErrors(validateAccount, showError)} />
    </hbox>
  {/if}

  <hbox class="spacer1" flex />

  {#if validating}
    <StatusMessage status="processing"
      message={$t`Verifying that the configuration works...`} />
  {/if}
  {#if errorMessage}
    <ErrorMessage {errorMessage} errorGravity={ErrorGravity.Error}
      on:continue={() => errorMessage = null} />
  {/if}

  <hbox class="spacer2" flex />

  <vbox class="workspace">
    <hbox class="header">{$t`Workspace`}</hbox>
    <WorkspaceSelector config={account} horizontal={true} />
  </vbox>
{/if}

<ButtonsBottom
  canContinue={havePassword && !validating}
  onContinue={validateAccount}
  errorCallback={showError}
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
  import { saveAndInitConfig } from "../../../../logic/Mail/AutoConfig/saveConfig";
  import Password from "../Shared/Password.svelte";
  import WorkspaceSelector from "../Mail/WorkspaceSelector.svelte";
  import Header from "../Shared/Header.svelte";
  import StatusMessage from "../Shared/StatusMessage.svelte";
  import ErrorMessage, { ErrorGravity } from "../Shared/ErrorMessage.svelte";
  import ButtonsBottom from "../Shared/ButtonsBottom.svelte";
  import Button from "../../../Shared/Button.svelte";
  import { Cancelled } from "../../../../logic/util/Abortable";
  import { catchErrors } from "../../../Util/error";
  import { t } from "../../../../l10n/l10n";

  export let accounts: MailAccount[] = [];
  export let onContinue = () => undefined;
  export let onBack = () => undefined;

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
      onContinue();
      return;
    }
    resetForAccount();
  }

  function previousAccount() {
    account = accounts[--currentAccountIndex];
    if (currentAccountIndex < 0) {
      onBack();
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
  .buttons.login {
    justify-content: center;
  }
  .password-row {
    align-items: center;
  }
  .password-row label {
    margin-right: 24px;
  }
  .spacer1,
  .spacer2 {
    min-height: 5vh;
  }
  .workspace {
    margin-bottom: 32px;
  }
  .workspace .header {
    font-size: 20px;
    font-weight: bold;
    margin-top: 24px;
    margin-bottom: 8px;
  }
</style>
