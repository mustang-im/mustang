<Button label={$t`Login`}
  classes="filled large"
  onClick={loginOAuth2}
  errorCallback={showError}
  disabled={oAuth2Succeeded}
  />

{#if errorMessage}
  <ErrorMessage {errorMessage} errorGravity={ErrorGravity.Error}
    on:continue={() => errorMessage = null} />
{/if}

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import Button from "../../Shared/Button.svelte";
  import ErrorMessage, { ErrorGravity } from "../Shared/ErrorMessage.svelte";
  import { Cancelled } from "../../../logic/util/Abortable";
  import { t } from "../../../l10n/l10n";

  export let account: MailAccount;
  export let oAuth2Succeeded = false;
  export let allowConfigChange = false;

  let errorMessage: string = null;

  async function loginOAuth2() {
    await account.oAuth2.login(true);
    oAuth2Succeeded = true;
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
</style>
