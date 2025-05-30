<vbox flex class="setup-mail-window">
  <hbox flex />
  <vbox class="page-box" step={step}>
    {#if step == Step.EmailAddress || step == Step.FindConfig || step == Step.FoundConfig || step == Step.CheckConfig || step == Step.Error}
      <EmailAddressPassword bind:emailAddress bind:password
        on:continue={onContinue} />
    {/if}
    {#if errorMessage}
      <ErrorMessage {errorMessage} {errorGravity}
        on:continue={clearError} />
    {/if}
    {#if step == Step.FindConfig}
      <FindConfig bind:config bind:altConfigs {emailAddress} {password}
        on:continue={onFindConfigSucceeded} on:fail={onFindConfigFailed} {abort} />
    {:else if step == Step.FoundConfig}
      <FoundConfig bind:config {altConfigs} haveError={!!errorMessage} />
    {:else if step == Step.Instructions}
      <Instructions bind:config bind:password />
    {:else if step == Step.Login}
      <LoginPage account={config} onContinue={onLoginSucceeded} />
    {:else if step == Step.CheckConfig}
      <CheckConfig {config} {emailAddress} {password}
        on:continue={onCheckConfigSucceeded} on:fail={onCheckConfigFailed} {abort} />
    {:else if step == Step.ManualConfig}
      <ManualConfigPage bind:config bind:this={manualConfigEl} {abort} />
    {:else if step == Step.FinalizeConfig}
      <FinalizeConfig {config} />
    {/if}
    <ButtonsBottom {canContinue}
      onContinue={onContinue}
      errorCallback={showError}
      onReset={reset}
      showReset={step != Step.EmailAddress}
      showContinue={step != Step.Login}
      canCancel={true}
      onCancel={onClose}
      >
      {#if step != Step.ManualConfig && step != Step.CheckConfig && step != Step.FinalizeConfig}
        <Button label={$t`Manual setup`} classes="secondary"
          disabled={!canContinue}
          onClick={onManualSetup}
          />
      {/if}
      <!-- Enable once we offer hosting service -->
      {#if false && step == Step.EmailAddress}
        <Button label={$t`New email address`} classes="secondary"
          onClick={onNewEmailAddress}
          />
      {/if}
    </ButtonsBottom>
    {#if step == Step.EmailAddress}
      <Footer />
    {/if}
  </vbox>
  <hbox flex />
  <BackgroundVideo />
</vbox>

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import { saveAndInitConfig, fillConfig  } from "../../../logic/Mail/AutoConfig/saveConfig";
  import { makeManualConfig } from "../../../logic/Mail/AutoConfig/manualConfig";
  import { openApp, selectedApp } from "../../AppsBar/selectedApp";
  import { SetupMustangApp } from "../SetupMustangApp";
  import { mailMustangApp } from "../../Mail/MailMustangApp";
  import { Cancelled } from "../../../logic/util/Abortable";
  import EmailAddressPassword from "./EmailAddressPassword.svelte";
  import FindConfig from "./FindConfig.svelte";
  import FoundConfig from "./FoundConfig.svelte";
  import LoginPage from "./LoginPage.svelte";
  import CheckConfig from "./CheckConfig.svelte";
  import FinalizeConfig from "./FinalizeConfig.svelte";
  import ManualConfigPage from "../../Settings/Mail/Manual/ManualConfigPage.svelte";
  import Instructions from "./Instructions.svelte";
  import ErrorMessage, { ErrorGravity } from "../../Shared/ErrorMessage.svelte";
  import Footer from "../Shared/Footer.svelte";
  import ButtonsBottom from "../Shared/ButtonsBottom.svelte";
  import BackgroundVideo from "../Shared/BackgroundVideo.svelte";
  import Button from "../../Shared/Button.svelte";
  import { logError } from "../../Util/error";
  import { NotReached } from "../../../logic/util/util";
  import type { ArrayColl } from "svelte-collections";
  import { t } from "../../../l10n/l10n";

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
    Instructions = 9,
    Login = 10,
  }
  let step: Step = Step.EmailAddress;
  let abort = new AbortController();

  function onFindConfigSucceeded() {
    if (step != Step.FindConfig) {
      return;
    }
    step = Step.FoundConfig;
  }
  function onFindConfigFailed(event: CustomEvent) {
    let ex = event.detail;
    if (ex instanceof Cancelled) {
      reset();
    } else {
      showError(ex);
      onManualSetup();
    }
  }
  function onLoginSucceeded() {
    step = Step.CheckConfig;
  }
  function onCheckConfigSucceeded() {
    if (step != Step.CheckConfig) {
      return;
    }
    step = Step.FinalizeConfig;
  }
  function onCheckConfigFailed(event: CustomEvent) {
    let ex = event.detail;
    if (ex instanceof Cancelled) {
      reset();
    } else {
      step = config?.source == "manual" ? Step.ManualConfig : Step.FoundConfig;
      showError(ex);
    }
  }
  function onManualSetup() {
    if (!config ||
        !config.outgoing && (config.protocol == "imap" || config.protocol == "pop3")) {
      config = makeManualConfig(emailAddress, password);
    } else {
      fillConfig(config, emailAddress, password);
    }
    step = Step.ManualConfig;
  }
  function onNewEmailAddress() {
    step = Step.RegisterNew;
  }

  let manualConfigEl: ManualConfigPage;

  $: canContinue =
    step == Step.EmailAddress && !!emailAddress && !!password ||
    step == Step.FoundConfig ||
    step == Step.ManualConfig ||
    step == Step.FinalizeConfig;

  async function onContinue() {
    if (step == Step.EmailAddress) {
      step = Step.FindConfig;
    } else if (step == Step.FindConfig) {
      step = Step.FoundConfig;
      if (config?.source == "local") {
        await onContinue();
      }
    } else if (step == Step.FoundConfig) {
      fillConfig(config, emailAddress, password);
      errorMessage = null;
      if (config.setupInstructions) {
        step = Step.Instructions;
      } else if (config.oAuth2) {
        step = Step.Login;
      } else {
        step = Step.CheckConfig;
      }
    } else if (step == Step.Instructions) {
      step = Step.CheckConfig;
    } else if (step == Step.ManualConfig) {
      errorMessage = null;
      if (!await manualConfigEl.onContinue()) {
        return;
      }
      fillConfig(config, emailAddress, password);
      errorMessage = null;
      step = Step.CheckConfig;
    } else if (step == Step.CheckConfig) {
      step = Step.FinalizeConfig;
    } else if (step == Step.FinalizeConfig) {
      await onSave();
    } else {
      throw new NotReached();
    }
  }

  $: emailAddress, resetMaybe();
  function resetMaybe() {
    if (step != Step.EmailAddress) {
      reset();
    }
  }
  function reset() {
    abort.abort();
    config = null;
    altConfigs?.clear();
    errorMessage = null;
    isSaving = false;
    step = Step.EmailAddress;
  }

  // Error

  let errorMessage: string | null = null;
  let errorGravity: ErrorGravity = ErrorGravity.OK;

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
    errorGravity = ErrorGravity.Error;
  }

  function clearError() {
    errorMessage = null;
    errorGravity = ErrorGravity.OK;
  }

  let isSaving = false;
  async function onSave() {
    if (isSaving) { // Don't run twice, e.g. when user clicks the button twice or in case of errors
      return;
    }
    isSaving = true;
    await saveAndInitConfig(config, emailAddress, password);
    onClose();
  }

  function onClose() {
    abort.abort();
    if ($selectedApp instanceof SetupMustangApp && typeof($selectedApp.onBack) == "function") {
      $selectedApp.onBack();
    } else {
      openApp(mailMustangApp);
    }
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
