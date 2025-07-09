<!-- Svelte's bind:group only works for literal <input type=radio>
 https://github.com/sveltejs/svelte/issues/2308 -->
<radiogroup class:vertical>
  {#each items as item, i}
    <hbox title={item.tooltip ?? item.label}>
      <input type="radio"
        value={item.value}
        checked={item.value === value}
        on:change={() => onChanged(item)}
        {disabled}
        id={"radio" + i}
        />
      <label for={"radio" + i}>{item.label}</label>
    </hbox>
  {/each}
</radiogroup>

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  const dispatchEvent = createEventDispatcher<{ change: any }>();

  export let items: RadioOption[] = [];
  export let value: any;
  export let disabled = false;
  export let vertical = false;

  function onChanged(item: any) {
    value = item.value;
    dispatchEvent("change", item);
  }
</script>
<script lang="ts" context="module">
  export type RadioOption = {label: string, tooltip?: string, value: any, disabled?: boolean};
</script>

<style>
  radiogroup {
    display: flex;
    flex-direction: row;
  }
  radiogroup.vertical {
    flex-direction: column;
  }
</style>
