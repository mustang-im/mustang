{#if $dialog?.kind == "properties"}
  {#key $dialog}
    <CalendarPropertiesDialog calendar={$dialog.calendar} tab={$dialog.tab} on:close={onClose} />
  {/key}
{:else if $dialog?.kind == "open-calendar"}
  <OpenCalendarDialog account={$dialog.account} fromAddressBook={$dialog.fromAddressBook} on:close={onClose} />
{:else if $dialog?.kind == "rename"}
  <RenameDialog account={$dialog.calendar} title={$t`Rename Calendar`} on:close={onClose} />
{:else if $dialog?.kind == "view-settings"}
  <ViewSettingsDialog isTable={$dialog.isTable} on:close={onClose} />
{/if}

<script lang="ts">
  import { CalendarDialogs } from "./CalendarDialogs";
  import CalendarPropertiesDialog from "../CalendarPropertiesDialog.svelte";
  import OpenCalendarDialog from "../OpenCalendarDialog.svelte";
  import RenameDialog from "../../Settings/Shared/RenameDialog.svelte";
  import { t } from "../../../l10n/l10n";
  import ViewSettingsDialog from "../ViewSettings/ViewSettingsDialog.svelte";

  const dialog = CalendarDialogs.current;

  function onClose() {
    CalendarDialogs.close();
  }
</script>
