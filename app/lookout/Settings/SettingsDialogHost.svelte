{#if $dialog?.kind == "options"}
  <OptionsDialog category={$dialog.category} on:close={onClose} />
{/if}

<script lang="ts">
  import { SettingsDialogs } from "./SettingsDialogs";
  import OptionsDialog from "./Options/OptionsDialog.svelte";

  const dialog = SettingsDialogs.current;

  function onClose() {
    SettingsDialogs.close();
  }
</script>
