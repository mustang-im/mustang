{#each flow.seriesChoices() as choice}
  <MenuItem label={flow.seriesChoiceLabel(choice)} disabled={flow.seriesChoiceDisabled(choice)}
    onClick={() => flow.saveWith(choice)} />
{/each}

<script lang="ts">
  import type { EventEditFlow } from "./EventEditFlow";
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";

  export let flow: EventEditFlow;
</script>
