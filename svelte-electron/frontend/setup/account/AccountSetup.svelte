<script>
  import AccountConfig from "../../../../logic/account/setup/AccountConfig.js";
  //import { remote } from "electron";
  import { onMount, onDestroy } from "svelte";
  //const AccountConfig = remote.getGlobal("AccountConfig");

  // Dialog pages
  import InputEmailAddress from "./InputEmailAddress.svelte";
  import AutoConfig from "./AutoConfig.svelte";
  import ManualConfig from "./ManualConfig.svelte";
  import ConfirmConfig from "./ConfirmConfig.svelte";
  import TestConfig from "./TestConfig.svelte";
  let allSteps = [ InputEmailAddress, AutoConfig, ManualConfig, ConfirmConfig, TestConfig ];
  let currentStep = InputEmailAddress;
  let canContinue = false;

  let config = new AccountConfig();
  config.realName = "You";
  config.emailAddress = "";
  config.password = "";

  export let name; // dummy for app name

  function continueStep() {
    let nextStep = allSteps[allSteps.indexOf(currentStep) + 1];
    if (nextStep) {
      currentStep = nextStep;
    } else { // end
      // create account, using config
      window.close();
    }
  }

  function backStep() {
    let nextStep = allSteps[allSteps.indexOf(currentStep) - 1];
    if (nextStep) {
      currentStep = nextStep;
    }
  }

  function cancel() {
    window.close();
  }

  function manualConfig() {
    if (config) {
      config.forceManual = true;
    }
    currentStep = ManualConfig;
  }
</script>

<h1>Set up your email address</h1>

{#each allSteps as step}
  {#if currentStep == step }
    <svelte:component this={step} bind:config bind:canContinue on:continue={continueStep} />
  {/if}
{/each}

<!--
{#if currentStep == InputEmailAddress }
<InputEmailAddress
  bind:realName bind:emailAddress bind:password />
{:else if currentStep == AutoConfig }
<AutoConfig emailAddress={emailAddress} bind:config />
{:else if currentStep == ManualConfig }
<ManualConfig emailAddress={emailAddress} bind:config />
{:else if currentStep == ConfirmConfig }
<ConfirmConfig config={config} />
{:else if currentStep == TestConfig }
<TestConfig config={config} on:done={continueStep}/>
{:else}
<span class="error">Unknown step</span>
{/if}
-->

<hbox id="buttons">
  {#if currentStep == ConfirmConfig && config && config.emailAddress && config.password && config.realName }
  <button id="manual" on:click={manualConfig}>Manual config</button>
  {/if}
  <button id="cancel" on:click={cancel}>Cancel</button>
  {#if currentStep != allSteps[0]}
  <button id="back" on:click={backStep}>Back</button>
  {/if}
  <button id="continue"  disabled={ !canContinue } on:click={continueStep}>
    {#if currentStep == allSteps[allSteps.length - 1]}
      Done
    {:else}
      Continue
    {/if}
  </button>
</hbox>

<style>
  h1 {
    font-size: large;
    font-weight: bold;
  }
  #buttons {
    align: end;
    margin-top: 3em;
  }
</style>
