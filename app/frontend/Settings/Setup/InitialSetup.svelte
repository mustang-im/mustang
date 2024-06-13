{#if isImporting}
  <Import onContinue={onImportFinished} onCancel={onImportSkip} />
{:else}
  <SetupMail />
{/if}

<script lang="ts">
  import SetupMail from "./Mail/SetupMail.svelte";
  import Import from "./Import/Import.svelte";

  let isImporting = true;

  function onImportSkip() {
    isImporting = false;
  }
  function onImportFinished() {
    isImporting = false;
  }
</script>

<style>
</style>
