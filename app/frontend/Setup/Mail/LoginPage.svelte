{#if account?.oAuth2}
  <OAuth2Login {account}
    onContinue={onContinue}
    onError={showError}
    />
{:else}
  <Header title={account.name} subtitle={account.emailAddress} />

  <hbox class="password-row">
    <label for="password">{$t`Password`}</label>
    <Password bind:password={account.password}
      autofocus={true}
      on:continue={() => catchErrors(onContinue, showError)} />
  </hbox>
{/if}

{#if errorMessage}
  <ErrorMessage {errorMessage} errorGravity={ErrorGravity.Error}
    on:continue={() => errorMessage = null} />
{/if}

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import Password from "../Shared/Password.svelte";
  import OAuth2Login from "../Shared/OAuth2Login.svelte";
  import Header from "../Shared/Header.svelte";
  import ErrorMessage, { ErrorGravity } from "../../Shared/ErrorMessage.svelte";
  import { Cancelled } from "../../../logic/util/Abortable";
  import { catchErrors, logError } from "../../Util/error";
  import { t } from "../../../l10n/l10n";

  export let account: MailAccount;
  export let onContinue = () => undefined;

  let errorMessage: string = null;

  function showError(ex: Error | string) {
    if (typeof (ex) == "string") {
      ex = new Error(ex);
    }
    if (ex instanceof Cancelled) {
      return;
    }
    console.error(ex);
    logError(ex);
    errorMessage = ex.message;
  }

  // TODO Copy password to SMTP
</script>

<style>
  .password-row {
    align-items: center;
  }
  .password-row label {
    margin-inline-end: 24px;
  }
  .password-row :global(input) {
    min-width: 30em;
  }
  .spacer1,
  .spacer2 {
    min-height: 5vh;
  }
</style>
