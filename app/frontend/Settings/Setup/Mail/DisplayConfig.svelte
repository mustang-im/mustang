<grid class="result">
  <DisplayConfigServer {config} />
  {#if config.outgoing}
    <DisplayConfigServer config={config.outgoing} />
  {/if}
</grid>

<script lang="ts">
  import type { MailAccount } from "../../../../logic/Mail/MailAccount";
  import DisplayConfigServer from "./DisplayConfigServer.svelte";

  /** in */
  export let config: MailAccount;
</script>

<style>
  grid.result {
    grid-template-columns: auto auto auto auto auto;
    align-items: center;
  }
</style>
