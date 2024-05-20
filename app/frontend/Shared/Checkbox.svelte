<hbox class={classes} class:on={checked === true} class:off={checked === false} class:indetermined={checked === undefined || checked === null}>
  {#if checked === true}
    <Checkbox
      checked
      on:click={onToggle}
      bind:id
      color="var(--selected-bg)"
      size="sm" radius="sm" />
  {:else if checked == false}
    <Checkbox
      indeterminate
      on:click={onToggle}
      bind:id
      color="var(--selected-bg)"
      size="sm" radius="sm" />
  {:else}
    <Checkbox
      on:click={onToggle}
      bind:id
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

  export let checked;
  export let label = "";
  export let classes = "";

  let id: string;

  let haveIndetermined = checked === undefined || checked === null;
  function onToggle() {
    if (checked === true) {
      checked = false;
    } else if (checked === false && haveIndetermined) {
      checked = undefined;
    } else if (checked === false) {
      checked = true;
    } else if (checked === undefined || checked === null) {
      checked = true;
    } else {
      checked = true;
    }
  }
</script>

<style>
  hbox {
    align-items: center;
  }
  label {
    display: flex;
    align-items: center;
    margin-left: 8px;
  }
  label :global(svg) {
    margin-right: 4px;
  }
  hbox.indetermined label {
    opacity: 60%;
  }
</style>
