{#each SizeRanges.named as size}
  <MenuItem label={SizeRanges.label(size)} checkable checked={size == selected}
    onClick={() => onSelect(size == selected ? SizeRange.Any : size)} />
{/each}

<script lang="ts">
  import { SizeRange, SizeRanges } from "./SearchRanges";
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";

  export let selected: SizeRange;
  export let onSelect: (size: SizeRange) => void;
</script>
