{#if $dialog?.kind == "properties"}
  {#key $dialog}
    <CalendarPropertiesDialog calendar={$dialog.calendar} tab={$dialog.tab} on:close={onClose} />
  {/key}
{:else if $dialog?.kind == "open-calendar"}
  <OpenCalendarDialog account={$dialog.account} fromAddressBook={$dialog.fromAddressBook} on:close={onClose} />
{:else if $dialog?.kind == "rename"}
  <RenameCalendarDialog calendar={$dialog.calendar} on:close={onClose} />
{:else if $dialog?.kind == "view-settings"}
  <ViewSettingsDialog isTable={$dialog.isTable} on:close={onClose} />
{/if}

<script lang="ts">
  import { CalendarDialogs } from "./CalendarDialogs";
  import CalendarPropertiesDialog from "./CalendarPropertiesDialog.svelte";
  import OpenCalendarDialog from "./OpenCalendarDialog.svelte";
  import RenameCalendarDialog from "./RenameCalendarDialog.svelte";
  import ViewSettingsDialog from "../ViewSettings/ViewSettingsDialog.svelte";

  const dialog = CalendarDialogs.current;

  function onClose() {
    CalendarDialogs.close();
  }
</script>
