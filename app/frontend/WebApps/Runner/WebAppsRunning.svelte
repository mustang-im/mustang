<vbox class="running-apps" flex>
  {#if $showingWebApp}
    <WebAppRunner app={$showingWebApp} />
  {/if}
</vbox>

<script lang="ts">
  import { showingWebApp } from "./WebAppsRunning";
  import WebAppRunner from "./WebAppRunner.svelte";
</script>
