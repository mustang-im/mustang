<script lang="ts">
  import { RibbonModel } from "../../Shared/Ribbon/Ribbon";
  import { getContext } from "svelte";
  import { get } from "svelte/store";

  export let selectedLabel: string = null;

  const ribbon = getContext<RibbonModel>(RibbonModel.contextKey);
  const selectedTab = ribbon.selectedTab;
  $: selectedLabel = $selectedTab?.label ?? null;

  export function select(label: string) {
    let tab = get(ribbon.tabs).find(tab => tab.label == label);
    if (tab) {
      ribbon.selectTab(tab);
    }
  }

  export function selectFirst() {
    let tab = get(ribbon.tabs)[0];
    if (tab) {
      ribbon.selectTab(tab);
    }
  }
</script>
