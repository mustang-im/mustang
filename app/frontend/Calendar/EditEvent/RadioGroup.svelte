<!--
  Svelte's bind:group only works for literal <input type=radio> (issue 2308).
  Svelteui's <RadioGroup> doesn't seem to work at all.
  Svelteui's <Radio bind:group> doesn't seem to work properly either.
  TODO: support other Svelteui <Radio> properties
-->
<vbox>
  {#each items as item}
    <Radio {...item} checked={item.value === group} on:change={() => group = item.value} />
  {/each}
</vbox>

<script lang="ts">
  import { Radio } from "@svelteuidev/core";
  export let items = [];
  export let group;
</script>
