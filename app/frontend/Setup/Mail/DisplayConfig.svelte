<grid class="result">
  <DisplayConfigServer {config} />
  {#each childServices as childService}
    {#if childService}
      <DisplayConfigServer config={childService} />
    {/if}
  {/each}
</grid>

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import DisplayConfigServer from "./DisplayConfigServer.svelte";

  /** in */
  export let config: MailAccount;

  $: childServices = [ config.outgoing,
    config.setup?.calendar, config.setup?.addressbook,
    config.setup?.fileShare, config.setup?.meet ];
</script>

<style>
  grid.result {
    grid-template-columns: auto auto auto auto auto;
    align-items: center;
  }
</style>
