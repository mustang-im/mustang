<vbox flex>
  Call history TODO
</vbox>

{#if $appGlobal.isMobile}
  <CallHistoryBarM />
{/if}

<script lang="ts">
  import { appGlobal } from "../../../logic/app";
  import CallHistoryBarM from "./CallHistoryBarM.svelte";
</script>
