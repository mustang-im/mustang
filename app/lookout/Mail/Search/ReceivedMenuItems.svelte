{#each ReceivedRanges.named as range}
  <MenuItem label={ReceivedRanges.label(range)} checkable checked={range == selected}
    onClick={() => onSelect(range == selected ? ReceivedRange.Any : range)} />
{/each}

<script lang="ts">
  import { ReceivedRange, ReceivedRanges } from "./SearchRanges";
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";

  export let selected: ReceivedRange;
  export let onSelect: (range: ReceivedRange) => void;
</script>
