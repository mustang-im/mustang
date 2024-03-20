<hbox flex class="middle"
  class:error={errorGravity == ErrorGravity.Error}
  class:warning={errorGravity == ErrorGravity.Warning}
  >
  <hbox flex class="message">
    {#if errorGravity == ErrorGravity.Error}
      <ErrorIcon />
    {:else if errorGravity == ErrorGravity.Warning}
      <WarningIcon />
    {/if}
    <hbox>{errorMessage}</hbox>
    <RoundButton icon={CloseIcon} on:click={onClose} />
  </hbox>
</hbox>

<script lang="ts" context="module">
  export enum ErrorGravity {
    Error = "error",
    Warning = "warning",
    OK = "ok",
  }
</script>

<script lang="ts">
  import RoundButton from "../../Shared/RoundButton.svelte";
  import ErrorIcon from "lucide-svelte/icons/alert-triangle";
  import WarningIcon from "lucide-svelte/icons/alert-circle";
  import CloseIcon from "lucide-svelte/icons/x";
  import { createEventDispatcher } from 'svelte';
  const dispatchEvent = createEventDispatcher();

  /** in/out */
  export let errorMessage: string;
  /** in/out */
  export let errorGravity: ErrorGravity;

  function onClose() {
    dispatchEvent("continue");
  }
</script>

<style>
  .middle {
    margin-top: 24px;
    margin-bottom: 20px;
  }
  .message {
    margin-left: 8px;
    margin-right: 24px;
    padding: 4px 24px;
    border-radius: 16px;
  }
  .error .message {
    background-color: #FFFAEC;
    color: #FFC83A;
  }
  .warning .message {
    background-color: #FFFAEC;
    color: #FFC83A;
  }
  .middle .message :global(svg) {
    margin-right: 6px;
  }
</style>
