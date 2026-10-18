{#each SizeRanges.named as size}
  <MenuItem label={SizeRanges.label(size)} checkable checked={size == selected}
    onClick={() => select(size == selected ? SizeRange.Any : size)} />
{/each}

<script lang="ts">
  import { SizeRange, SizeRanges } from "./SearchRanges";
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";
  import { createEventDispatcher } from "svelte";

  export let selected: SizeRange;

  const dispatch = createEventDispatcher<{ select: SizeRange }>();

  function select(size: SizeRange) {
    selected = size;
    dispatch("select", size);
  }
</script>
