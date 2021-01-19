<script>
  //import { getAccountProviderWithNet } from "../../../../logic/account/setup/setup.js";
  //import { remote } from "electron";
  import { onMount, onDestroy, createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  //const getAccountProviderWithNet = remote.getGlobal("getAccountProviderWithNet");
  function getAccountProviderWithNet(domain, emailAddress, successCallback, errorCallback) {
    setTimeout(() => {
      config.incoming.type = "imap";
      config.incoming.hostname = "imap.%EMAILDOMAIN%";
      config.outgoing.hostname = "smtp.%EMAILDOMAIN%";
      config.incoming.socketType = "ssl";
      config.outgoing.socketType = "ssl";
      config.incoming.port = 993;
      config.outgoing.port = 465;
      config.incoming.auth = "passwordCleartext";
      config.outgoing.auth = "passwordCleartext";
      config.incoming.username = "%EMAILADDRESS%";
      config.outgoing.username = "%EMAILADDRESS%";
      config.replaceVariables();
      successCallback(config);
    }, 1000);
    return { cancel() {} };
  }

  export let config = {};
  export let canContinue;
  canContinue = false;

  let abortable;
  let errorMessage;

  function findConfig() {
    config.domain = config.emailAddress.split("@")[1];
    abortable = getAccountProviderWithNet(config.domain, config.emailAddress, foundConfig => {
      abortable = null;
      config = foundConfig;
      if (config.isComplete()) {
        dispatch("continue");
      }
    }, showError);
  }
  onMount(findConfig);

  function showError(ex) {
    errorMessage = ex && ex.message ? ex.message : ex + "";
    abortable = null;
  }

  onDestroy(() => {
    if (abortable) {
      abortable.cancel();
    }
  });
</script>

<h2>Searching the configuration for {config.emailAddress}</h2>

{#if errorMessage }
<div class="error">{ errorMessage }</div>
{:else if abortable }
<div class="progress">Auto configure...</div>
{/if}

<style>
  h2 {
    font-size: large;
    font-weight: bold;
  }
</style>
