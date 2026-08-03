<vbox flex class="setup-mail-window">
  <hbox flex />
  <vbox class="page-box">
    {#if error}
      <ErrorMessageInline ex={error} />
    {/if}
    {#if isLoginStep}
      <LoginPage account={account} onContinue={onLoginSucceeded} />
      <Footer />
    {:else}
      <CheckConfig config={account} emailAddress={account.emailAddress} password={account.password}
        on:continue={onCheckSucceeded} on:fail={e => onCheckFailed(e.detail)} {abort} />
    {/if}
  </vbox>
  <hbox flex />
  <BackgroundVideo />
</vbox>

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import { saveAndInitConfig } from "../../../logic/Mail/AutoConfig/saveConfig";
  import { openApp } from "../../AppsBar/selectedApp";
  import { mailMustangApp } from "../../Mail/MailMustangApp";
  import LoginPage from "./LoginPage.svelte";
  import CheckConfig from "./CheckConfig.svelte";
  import Footer from "../Shared/Footer.svelte";
  import BackgroundVideo from "../Shared/BackgroundVideo.svelte";
  import ErrorMessageInline from "../../Shared/ErrorMessageInline.svelte";

  export let account: MailAccount;

  let isLoginStep = true;
  let error: Error | null = null;
  let abort = new AbortController();

  async function onLoginSucceeded() {
    isLoginStep = false;
  }
  async function onCheckSucceeded() {
    await saveAndInitConfig(account, account.emailAddress, account.password);
    onClose();
  }
  function onCheckFailed(ex: Error) {
    error = ex;
  }
  function onClose() {
    abort.abort();
    openApp(mailMustangApp, { account });
  }
</script>

<style>
  .setup-mail-window {
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
  .page-box[step="8"] {
    max-width: 90%;
  }
  .page-box[step="1"] :global(.password) {
    margin-block-end: 32px;
  }
  .setup-mail-window :global(input) {
    font-size: 16px;
  }
  .setup-mail-window :global(input::placeholder) {
    font-weight: 300;
  }
</style>
