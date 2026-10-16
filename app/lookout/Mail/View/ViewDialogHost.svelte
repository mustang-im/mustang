{#if $dialog?.kind == "view-settings"}
  <ViewSettingsDialog folder={$dialog.folder} on:close={onClose} />
{:else if $dialog?.kind == "show-columns"}
  <ShowColumnsDialog columns={MailViewSettings.of(showColumnsFolder).columns}
    onOK={columns => MailViewSettings.change(showColumnsFolder, { columns })}
    on:close={onClose} />
{:else if $dialog?.kind == "apply-view"}
  <ApplyViewDialog folder={$dialog.folder} on:close={onClose} />
{:else if $dialog?.kind == "apply-scope"}
  <ApplyScopeDialog question={$dialog.question} onChoice={$dialog.onChoice} on:close={onClose} />
{/if}

<script lang="ts">
  import { ViewDialogs } from "./ViewDialogs";
  import { MailViewSettings } from "./ViewSettings";
  import ViewSettingsDialog from "./ViewSettingsDialog.svelte";
  import ShowColumnsDialog from "./ShowColumnsDialog.svelte";
  import ApplyViewDialog from "./ApplyViewDialog.svelte";
  import ApplyScopeDialog from "./ApplyScopeDialog.svelte";
  import { onDestroy } from "svelte";

  const dialog = ViewDialogs.current;
  $: showColumnsFolder = $dialog?.kind == "show-columns" ? $dialog.folder : null;

  function onClose() {
    ViewDialogs.close();
  }

  onDestroy(onClose);
</script>
