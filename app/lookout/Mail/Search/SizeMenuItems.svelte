{#each SizeRanges.named as size}
  <MenuItem label={SizeRanges.label(size)} icon={size == selected ? CheckIcon : BlankIcon}
    onClick={() => onSelect(size == selected ? SizeRange.Any : size)} />
{/each}

<script lang="ts">
  import { SizeRange, SizeRanges } from "./SearchRanges";
  import MenuItem from "../../../frontend/Shared/Menu/MenuItem.svelte";
  import BlankIcon from "../../Shared/Menu/BlankIcon.svelte";
  import CheckIcon from "lucide-svelte/icons/check";

  export let selected: SizeRange;
  export let onSelect: (size: SizeRange) => void;
</script>
