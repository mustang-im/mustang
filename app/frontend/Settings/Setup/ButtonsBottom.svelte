<hbox class="buttons">
  <slot />
  {#if showReset}
    <Button label="Start over" classes="secondary"
      on:click={reset}
      />
  {/if}
  <hbox flex />
  <Button label="Next" classes="filled large"
    disabled={!canContinue}
    on:click={() => catchErrors(onContinue)}
    />
</hbox>

<script lang="ts">
  import Button from "../../Shared/Button.svelte";
  import { catchErrors } from "../../Util/error";
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let canContinue: boolean;
  export let showReset = false;

  async function onContinue() {
    dispatch("continue");
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
