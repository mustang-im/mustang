<vbox class="settings-panel" flex>
  <MainContent {category} />
</vbox>

{#if $appGlobal.isMobile}
  <PanelBarM />
{/if}

<script lang="ts">
  import { SettingsCategory } from "../SettingsCategory";
  import { appGlobal } from "../../../logic/app";
  import MainContent from "../Window/MainContent.svelte";
  import PanelBarM from "./PanelBarM.svelte";

  export let category: SettingsCategory;
</script>

<style>
  .settings-panel :global(.settings-content) {
    margin: 16px;
    padding-block-end: 16px;
  }
</style>
