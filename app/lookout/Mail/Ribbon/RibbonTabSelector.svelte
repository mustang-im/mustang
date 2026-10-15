<script lang="ts">
  import { RibbonModel } from "../../Shared/Ribbon/Ribbon";
  import { getContext, onMount } from "svelte";
  import { get } from "svelte/store";

  export let label: string;

  const ribbon = getContext<RibbonModel>(RibbonModel.contextKey);

  onMount(() => {
    let tab = get(ribbon.tabs).find(candidate => candidate.label == label);
    if (tab) {
      ribbon.selectTab(tab);
    }
  });
</script>
