<hbox class="buttons">
  <slot />
  {#if showReset}
    <Button label="Start over" classes="secondary"
      on:click={reset}
      />
  {/if}
  {#if canCancel}
    <Button label="Cancel" classes="secondary"
      on:click={onCancel}
      />
  {/if}
  <hbox flex />
  <Button label="Next" classes="filled large"
    disabled={!canContinue}
    onClick={onContinue}
    />
</hbox>

<script lang="ts">
  import Button from "../../../Shared/Button.svelte";
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let canContinue: boolean;
  export let canCancel = false;
  export let showReset = false;

  function onContinue() {
    dispatch("continue");
  }

  function onCancel() {
    dispatch("cancel");
  }

  function reset() {
    dispatch("reset");
  }
</script>

<style>
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
</style>
