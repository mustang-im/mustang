<hbox class="buttons">
  <slot />
  {#if showReset}
    <Button label={$t`Start over`} classes="secondary"
      onClick={onReset}
      {errorCallback}
      />
  {/if}
  {#if canCancel}
    <Button label={$t`Cancel`} classes="secondary"
      onClick={onCancel}
      {errorCallback}
      />
  {/if}
  <hbox flex />
  <Button label={$t`Next`} classes="filled large"
    disabled={!canContinue}
    onClick={onContinue}
    {errorCallback}
    />
</hbox>

<script lang="ts">
  import Button from "../../../Shared/Button.svelte";
  import { t } from "svelte-i18n-lingui";

  export let onContinue = (event: Event) => undefined;
  export let onCancel = (event: Event) => undefined;
  export let onReset = (event: Event) => undefined;
  export let canContinue: boolean;
  export let canCancel = false;
  export let showReset = false;
  export let errorCallback = (ex: Error) => undefined;
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
