<button on:click on:dblclick
  title={label} class="button {classes}" class:plain
  {disabled} class:disabled class:selected
  >
  <hbox class="icon">
    {#if typeof(icon) == "string"}
      <Icon data={icon} size={iconSize} />
    {:else if icon}
      <svelte:component this={icon} size={iconSize} />
    {:else}
      <slot name="icon" />
    {/if}
  </hbox>
  {#if hasIcon && hasLabel}
    <hbox class="gap" />
  {/if}
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
  export let selected = false;

  $: hasIcon = !!icon || $$slots.icon;
  $: hasLabel = (!!label || $$slots.label) && !iconOnly;
</script>

<style>
  button:not(.plain) {
    background-color: #f9f9f9;
    border: 1px solid #B2ADB8;
    border-radius: 1000px;
    padding: 6px 8px;

    flex-direction: row;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .plain {
    background-color: transparent;
    border-radius: 3px;
    border: none;
    min-width: 20px;
  }
  button:hover:not(.disabled) {
    background-color: rgba(32, 174, 158, 50%); /* #20AE9E */
  }
  button.selected:hover:not(.disabled) {
    background-color: rgba(32, 174, 158, 100%); /* #20AE9E */
  }
  .disabled {
    opacity: 50%;
  }
  .selected {
    background-color: #00000033;
  }
  .gap {
    width: 8px;
  }
  .plain .icon {
    margin-right: 0;
  }

  @media (prefers-color-scheme: light) {
    button {
      background-color: #f9f9f9;
    }
  }
</style>
