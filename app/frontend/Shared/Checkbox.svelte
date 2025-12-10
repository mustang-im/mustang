<hbox
  title={tooltip}
  class:on={checked === true}
  class:off={checked === false}
  class:indetermined={checked === undefined || checked === null}
  class:disabled
  class={classes}>
  {#if checked === true}
    <input type="checkbox"
      checked
      on:click={onToggle}
      {id}
      {disabled}
      />
  {:else if checked == false && allowIndetermined}
    <input type="checkbox"
      indeterminate
      on:click={onToggle}
      {id}
      {disabled}
      class="indetermined"
      />
  {:else}
    <input type="checkbox"
      on:click={onToggle}
      {id}
      {disabled}
      />
  {/if}
    <hbox class="icon-wrapper">
    {#if checked === true}
      <CheckIcon strokeWidth={5} size={12} />
    {:else if checked == false && allowIndetermined}
      <MinusIcon strokeWidth={5} size={12} />
    {/if}
    </hbox>
  <hbox>

  </hbox>
  <label for={id}>
    <slot name="icon" />
    {label}
  </label>
</hbox>

<script lang="ts">
  import CheckIcon from "lucide-svelte/icons/check";
  import MinusIcon from "lucide-svelte/icons/minus";
  import { createEventDispatcher } from "svelte";
  import { randomID } from "../../logic/util/util";
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

  let id: string = randomID();

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
  input {
    cursor: pointer;
    appearance: none;
    background: #fff;
    border: 1px solid var(--button-border);
    width: 20px;
    height: 20px;
    min-width: 20px;
    border-radius: 4px;
    padding: 0px;
    display: block;
    margin: 0px;
    transition: border-color 100ms, background-color 100ms;
  }
  input:checked {
    border: none;
    background-color: var(--selected-bg);
    color: #fff;
  }
  input.indetermined {
    border: none;
    background-color: red;
  }
  .icon-wrapper {
    position: absolute;
    width: 20px;
    height: 20px;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    color: #fff;
  }
</style>
