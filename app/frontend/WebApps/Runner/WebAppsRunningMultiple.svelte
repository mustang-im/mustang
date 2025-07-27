<vbox class="running-apps" flex>
  {#each webAppsRunning.each as webApp}
    <WebAppRunner app={webApp} hidden={$showingWebApp != webApp} />
  {/each}
</vbox>

<script lang="ts">
  import { webAppsRunning, showingWebApp } from "./WebAppsRunning";
  import WebAppRunner from "./WebAppRunner.svelte";
</script>
