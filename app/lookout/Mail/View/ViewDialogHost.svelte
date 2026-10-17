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
  import { MailViewSettings } from "../ViewSettings/ViewSettings";
  import ViewSettingsDialog from "../ViewSettings/ViewSettingsDialog.svelte";
  import ShowColumnsDialog from "../ViewSettings/ShowColumnsDialog.svelte";
  import ApplyViewDialog from "../ViewSettings/ApplyViewDialog.svelte";
  import ApplyScopeDialog from "../ViewSettings/ApplyScopeDialog.svelte";
  import { onDestroy } from "svelte";

  const dialog = ViewDialogs.current;
  $: showColumnsFolder = $dialog?.kind == "show-columns" ? $dialog.folder : null;

  function onClose() {
    ViewDialogs.close();
  }

  onDestroy(onClose);
</script>
