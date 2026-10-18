<vbox class="running-apps" flex>
  {#if $showingWebApp}
    <WebAppRunner app={$showingWebApp} />
  {/if}
</vbox>

<script lang="ts">
  import { getWebAppsRunning } from "./WebAppsRunning";
  import WebAppRunner from "./WebAppRunner.svelte";

  const { showingWebApp } = getWebAppsRunning();
</script>
