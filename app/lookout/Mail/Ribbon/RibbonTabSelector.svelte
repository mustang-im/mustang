<script lang="ts">
  import type { RibbonTabInfo } from "../../Shared/Ribbon/RibbonGroup";
  import { getContext, onMount } from "svelte";
  import { get, type Writable } from "svelte/store";

  export let label: string;

  const tabs = getContext<Writable<RibbonTabInfo[]>>("ribbonTabs");
  const selectedTab = getContext<Writable<RibbonTabInfo>>("ribbonSelectedTab");

  onMount(() => {
    let tab = get(tabs).find(candidate => candidate.label == label);
    if (tab) {
      selectedTab.set(tab);
    }
  });
</script>
