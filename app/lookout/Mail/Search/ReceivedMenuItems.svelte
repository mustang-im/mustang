{#each ReceivedRanges.named as range}
  <MenuItem label={ReceivedRanges.label(range)} icon={range == selected ? CheckIcon : BlankIcon}
    onClick={() => onSelect(range == selected ? ReceivedRange.Any : range)} />
{/each}

<script lang="ts">
  import { ReceivedRange, ReceivedRanges } from "./SearchRanges";
  import MenuItem from "../../../frontend/Shared/Menu/MenuItem.svelte";
  import BlankIcon from "../../Shared/Menu/BlankIcon.svelte";
  import CheckIcon from "lucide-svelte/icons/check";

  export let selected: ReceivedRange;
  export let onSelect: (range: ReceivedRange) => void;
</script>
