{#if appGlobal.isMobile}
  <FilesAppM />
{:else}
  <FilesAppD />
{/if}

<script lang="ts">
  import { appGlobal } from "../../logic/app";
  import FilesAppD from "./FilesAppD.svelte";
  import FilesAppM from "./FilesAppM.svelte";
</script>
