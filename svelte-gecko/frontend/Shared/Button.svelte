<button on:click on:dblclick class="button {classes}" class:plain title={label} class:disabled>
  <hbox class="icon">
    {#if typeof(icon) == "string"}
      <Icon data={icon} size={iconSize} />
    {:else if icon}
      <svelte:component this={icon} size={iconSize} />
    {:else}
      <slot name="icon" />
    {/if}
  </hbox>
  {#if !iconOnly}
    {#if label}
      <hbox class="label">{label}</hbox>
    {:else}
      <slot name="label" />
    {/if}
  {/if}
</button>

<script lang="ts">
  import Icon from 'svelte-icon/Icon.svelte';
  import type { ComponentType } from 'svelte';

  export let label: string = null;
  export let icon: ComponentType | string = null;
  export let classes = "";
  export let plain = false;
  export let iconSize = "16px";
  export let iconOnly = false;
  export let disabled = false;
</script>

<style>
  button {
    background-color: #f9f9f9;
    border: 1px solid #B2ADB8;
    border-radius: 5px;
    padding: 6px 8px;

    flex-direction: row;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .plain {
    background-color: transparent;
    border: none;
    padding: 0 0;
    min-width: 20px;
  }
  button:hover:not(.disabled) {
    background-color: rgba(32, 174, 158, 50%); /* #20AE9E */
  }
  .disabled {
    opacity: 50%;
  }
  .icon {
    /** margin-right: 6px; TODO only if both icon and label */
    margin-right: 0px;
  }
  .plain .icon {
    margin-right: 0;
  }

  /* @media (prefers-color-scheme: light) { */
</style>
