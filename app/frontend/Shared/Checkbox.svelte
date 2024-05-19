<hbox class={classes}>
  <Checkbox bind:checked
    bind:id
    color="var(--selected-bg)"
    size="sm" radius="sm" />
  <label for={id}>
    <slot name="icon" />
    {label}
  </label>
</hbox>

<script lang="ts">
  import { Checkbox } from "@svelteuidev/core";

  export let checked = false;
  export let label = "";
  export let classes = "";

  let id: string;
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
</style>
