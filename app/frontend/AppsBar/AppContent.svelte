<vbox flex class="app-frame">
  <svelte:component this={app.mainWindow} {...app.mainWindowProperties} />
</vbox>

<script lang="ts">
  import type { MustangApp } from "./MustangApp";

  export let app: MustangApp;
</script>
