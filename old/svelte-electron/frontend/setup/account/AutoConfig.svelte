<script>
  import { findAccountConfig } from "mustang-lib/logic/account/setup/setup.js";
  import { onMount, onDestroy, createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let config = {};
  export let canContinue;
  canContinue = false;

  let abortable;
  let errorMessage;

  function findConfig() {
    abortable = findAccountConfig(config.emailAddress, foundConfig => {
      abortable = null;
      config = foundConfig;
      if (config.isComplete()) {
        dispatch("continue");
      }
    }, showError);
  }
  onMount(findConfig);

  function showError(ex) {
    console.error(ex);
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
