<vbox class="error">
  <StatusMessage status={statusGravity(errorGravity)}
    message={errorMessage}>
    <hbox slot="icon">
      {#if errorGravity == ErrorGravity.Error}
        <ErrorIcon />
      {:else if errorGravity == ErrorGravity.Warning}
        <WarningIcon />
      {/if}
    </hbox>
    <hbox flex />
    <RoundButton icon={CloseIcon} iconSize="16px" classes="plain small" border={false}
      on:click={onClose} />
  </StatusMessage>
</vbox>

<script lang="ts" context="module">
  export enum ErrorGravity {
    Error = "error",
    Warning = "warning",
    OK = "ok",
  }
</script>

<script lang="ts">
  import StatusMessage from "../Setup/Shared/StatusMessage.svelte";
  import RoundButton from "./RoundButton.svelte";
  import ErrorIcon from "lucide-svelte/icons/triangle-alert";
  import WarningIcon from "lucide-svelte/icons/circle-alert";
  import CloseIcon from "lucide-svelte/icons/x";
  import { createEventDispatcher } from 'svelte';
  const dispatchEvent = createEventDispatcher();

  /** in/out */
  export let errorMessage: string;
  /** in/out */
  export let errorGravity: ErrorGravity;

  function onClose() {
    errorMessage = null;
    dispatchEvent("continue");
  }

  function statusGravity(errorGravity: ErrorGravity) {
    if (errorGravity == ErrorGravity.Error) {
      return "error";
    } else if (errorGravity == ErrorGravity.Warning) {
      return "warning";
    }
    return "";
  }
</script>

<style>
  .error {
    max-width: 50em;
  }
</style>
