<script lang="ts">
  import { RibbonModel } from "../../Shared/Ribbon/RibbonGroup";
  import { getContext, onMount } from "svelte";

  export let label: string;

  const ribbon = getContext<RibbonModel>(RibbonModel.contextKey);

  onMount(() => ribbon.selectTabByLabel(label));
</script>
