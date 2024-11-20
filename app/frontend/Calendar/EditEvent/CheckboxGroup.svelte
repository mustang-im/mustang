<!--
  Svelte's bind:group only works for literal <input type=checkbox> (issue 2308).
  This isn't a true bind:group because it can't react to changes in group.
  TODO: support other Svelteui <Checkbox> properties
-->
<hbox>
  <slot><label>{label}</label></slot>
  {#each items as item, i}
    <Checkbox {size} {radius} {...item} bind:checked={item.checked} {disabled} />
  {/each}
</hbox>

<script lang="ts">
  import { Checkbox } from "@svelteuidev/core";
  export let label = "";
  export let size = undefined;
  export let radius = undefined;
  export let items = [];
  export let group = [];
  export let disabled = false;

  for (let item of items) {
    item.checked = group.includes(item.value);
  }

  $: group = items.filter(item => item.checked).map(item => item.value);
</script>
