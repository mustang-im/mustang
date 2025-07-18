<hbox
  title={tooltip}
  class:on={checked === true}
  class:off={checked === false}
  class:indetermined={checked === undefined || checked === null}
  class:disabled
  class={classes}>
  {#if checked === true}
    <Checkbox
      checked
      on:click={onToggle}
      bind:id
      {disabled}
      color="var(--selected-bg)"
      size="sm" radius="sm" />
  {:else if checked == false && allowIndetermined}
    <Checkbox
      indeterminate
      on:click={onToggle}
      bind:id
      {disabled}
      color="red"
      size="sm" radius="sm" />
  {:else}
    <Checkbox
      on:click={onToggle}
      bind:id
      {disabled}
      color="var(--selected-bg)"
      size="sm" radius="sm" />
  {/if}
  <label for={id}>
    <slot name="icon" />
    {label}
  </label>
</hbox>

<script lang="ts">
  import { Checkbox } from "@svelteuidev/core";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher<{ change: boolean }>();

  /** in/out */
  export let checked: boolean | null | undefined;
  /** in only */
  export let label = "";
  export let classes = "";
  export let allowIndetermined = checked === undefined || checked === null;
  export let allowFalse = true;
  export let disabled = false;
  export let tooltip: string | null = null;

  let id: string;

  function onToggle() {
    if (disabled) {
      return;
    }
    if (checked === true && allowFalse) {
      checked = false;
    } else if (checked === true) {
      checked = undefined;
    } else if (checked === false && allowIndetermined) {
      checked = undefined;
    } else if (checked === false) {
      checked = true;
    } else if (checked === undefined || checked === null) {
      checked = true;
    } else {
      checked = true;
    }
    dispatch("change", checked);
  }
</script>

<style>
  hbox {
    align-items: center;
  }
  label {
    display: flex;
    align-items: center;
    margin-inline-start: 8px;
  }
  label :global(svg) {
    margin-inline-end: 4px;
  }
  hbox.indetermined label {
    opacity: 60%;
  }
</style>
