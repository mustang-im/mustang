{#if appGlobal.isMobile}
  <ChatAppM />
{:else}
  <ChatAppD />
{/if}

<script lang="ts">
  import { appGlobal } from "../../logic/app";
  import ChatAppD from "./ChatAppD.svelte";
  import ChatAppM from "./ChatAppM.svelte";
</script>
