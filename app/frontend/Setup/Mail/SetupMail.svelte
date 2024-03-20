<vbox flex class="setup-mail-window">
  <hbox flex />
  <vbox class="page-box">
    <EmailAddressPassword bind:emailAddress bind:password
      on:continue={onEmailAddressSucceeded} />
    {#if errorMessage}
      <ErrorMessage {errorMessage} {errorGravity}
        on:continue={clearError} />
    {/if}
    {#if step == Step.FindConfig}
      <FindConfig bind:config bind:altConfigs {emailAddress} {password}
        on:continue={onFindConfigSucceeded} on:fail={onFindConfigFailed} />
    {:else if step == Step.FoundConfig}
      <FoundConfig bind:config {altConfigs} />
    {:else if step == Step.CheckConfig}
      <CheckConfig {config}
        on:continue={onCheckConfigSucceeded} on:fail={onError} />
    {:else if step == Step.FinalizeConfig}
      <FinalizeConfig {config} />
    {:else if step == Step.ManualConfig}
      <ManualConfig bind:config />
    {/if}
    <hbox class="buttons">
      {#if step != Step.ManualConfig && step != Step.CheckConfig && step != Step.FinalizeConfig}
        <Button label="Manual setup" classes="secondary"
          disabled={!canContinueButton}
          on:click={onManualSetup}
          />
      {/if}
      {#if step == Step.EmailAddress}
        <Button label="Get new email address" classes="secondary"
          on:click={onNewEmailAddress}
          />
      {/if}
      <hbox flex />
      <Button label="Next" classes="filled large"
        disabled={!canContinueButton}
        on:click={onContinue}
        bind:buttonEl={nextButtonEl}
        />
    </hbox>
    {#if step == Step.EmailAddress}
      <Footer />
    {/if}
  </vbox>
  <hbox flex />
  <BackgroundVideo />
</vbox>

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import { createConfig } from "./autoconfig/createConfig";
  import { makeManualConfig } from "./autoconfig/manualConfig";
  import { openApp } from "../../AppsBar/selectedApp";
  import { mailMustangApp } from "../../Mail/MailMustangApp";
  import EmailAddressPassword from "./EmailAddressPassword.svelte";
  import FindConfig from "./FindConfig.svelte";
  import FoundConfig from "./FoundConfig.svelte";
  import CheckConfig from "./CheckConfig.svelte";
  import FinalizeConfig from "./FinalizeConfig.svelte";
  import ManualConfig from "./manual/ManualConfig.svelte";
  import ErrorMessage, { ErrorGravity } from "./ErrorMessage.svelte";
  import Footer from "./Footer.svelte";
  import Button from "../../Shared/Button.svelte";
  import BackgroundVideo from "./BackgroundVideo.svelte";
  import { NotReached } from "../../../logic/util/util";
  import type { ArrayColl } from "svelte-collections";

  let emailAddress: string;
  let password: string;

  let config: MailAccount;
  let altConfigs: ArrayColl<MailAccount>;

  enum Step {
    EmailAddress = 1,
    FindConfig = 2,
    FoundConfig = 3,
    CheckConfig = 4,
    FinalizeConfig = 5,
    Error = 6,
    RegisterNew = 7,
    ManualConfig = 8,
  }
  let step: Step = Step.EmailAddress;

  let nextButtonEl: HTMLButtonElement;

  async function onEmailAddressSucceeded() {
    nextButtonEl.focus();
    step = Step.FindConfig;
  }
  function onFindConfigSucceeded() {
    step = Step.FoundConfig;
  }
  function onFindConfigFailed(event: CustomEvent) {
    let ex = event.detail;
    console.log("find config error", ex, event);
    showError(ex);
    onManualSetup();
  }
  function onCheckConfigSucceeded() {
    step = Step.FinalizeConfig;
  }
  function onManualSetup() {
    if (!config || !config.outgoing) {
      config = makeManualConfig(emailAddress, password);
    }
    step = Step.ManualConfig;
  }
  function onNewEmailAddress() {
    step = Step.RegisterNew;
  }

  $: canContinueButton =
    step == Step.EmailAddress && emailAddress && password ||
    step == Step.FoundConfig ||
    step == Step.ManualConfig ||
    step == Step.FinalizeConfig;

  function onContinue() {
    if (step == Step.EmailAddress) {
      step = Step.FindConfig;
    } else if (step == Step.FindConfig) {
      step = Step.FoundConfig;
    } else if (step == Step.FoundConfig) {
      step = Step.CheckConfig;
    } else if (step == Step.ManualConfig) {
      step = Step.CheckConfig;
    } else if (step == Step.CheckConfig) {
      step = Step.FinalizeConfig;
    } else if (step == Step.FinalizeConfig) {
      onSave();
    } else {
      throw new NotReached();
    }
  }

  $: emailAddress, password, resetMaybe();
  function resetMaybe() {
    if (step != Step.EmailAddress) {
      reset();
    }
  }
  function reset() {
    // TODO abort ongoing jobs
    config = null;
    altConfigs?.clear();
    errorMessage = null;
    step = Step.EmailAddress;
  }

  // Error

  function onError(event: CustomEvent) {
    let ex = event.detail;
    console.log("error", ex, event);
    showError(ex);
  }

  let errorMessage: string | null = null;
  let errorGravity: ErrorGravity = ErrorGravity.OK;

  function showError(ex: Error | string) {
    if (typeof (ex) == "string") {
      ex = new Error(ex);
    }
    errorMessage = ex.message;
    errorGravity = ErrorGravity.Error;
  }

  function clearError() {
    errorMessage = null;
    errorGravity = ErrorGravity.OK;
    step = 1;
  }

  function onSave() {
    console.log("save config", config);
    createConfig(config);
    onClose();
  }

  function onClose() {
    openApp(mailMustangApp);
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
    background-color: white;
  }
  .page-box :global(.password) {
    margin-bottom: 32px;
  }
  .buttons {
    align-items: end;
    justify-content: end;
    margin-top: 32px;
  }
  .buttons :global(> *) {
    margin-right: 8px;
  }
  .buttons :global(button.secondary) {
    background-color: inherit;
    padding: 3px 8px;
    font-weight: 300;
    color: #455468;
  }
  .setup-mail-window :global(input) {
    font-size: 16px;
  }
  .setup-mail-window :global(input::placeholder) {
    font-weight: 300;
  }
</style>
