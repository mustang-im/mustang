<script lang="ts">
  import { RibbonModel } from "../../Shared/Ribbon/RibbonGroup";
  import { getContext } from "svelte";

  export let selectedLabel: string = null;

  const ribbon = getContext<RibbonModel>(RibbonModel.contextKey);
  const selectedTab = ribbon.selectedTab;
  $: selectedLabel = $selectedTab?.label ?? null;
</script>
