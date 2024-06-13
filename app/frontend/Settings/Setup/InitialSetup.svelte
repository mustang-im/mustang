{#if isImporting}
  <Import on:cancel={onSkipImport}/>
{:else}
  <SetupMail />
{/if}

<script lang="ts">
  import SetupMail from "./Mail/SetupMail.svelte";
  import Import from "./Import/Import.svelte";

  let isImporting = true;

  function onSkipImport() {
    isImporting = false;
  }
</script>

<style>
</style>
