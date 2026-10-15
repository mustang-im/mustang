<ContextMenu bind:this={contextMenu}>
  {#if calendar}
    <MenuItem label={$t`New Appointment`} icon={NewAppointmentIcon}
      onClick={() => CalendarActions.newEventAtSelection(calendar)} />
    <MenuItem label={$t`Show Only This Calendar`} icon={ShowOnlyIcon}
      onClick={() => CalendarActions.showOnly(calendar)} />
    <MenuDivider />
    {#if CalendarActions.canShare(calendar)}
      <MenuItem label={$t`Sharing Permissions`} icon={ShareIcon}
        onClick={() => CalendarActions.openSharing(calendar)} />
    {/if}
    <MenuItem label={$t`Import / Export`} icon={ImportIcon}
      onClick={() => CalendarActions.openImportExport(calendar)} />
    <MenuItem label={$t`Properties`} icon={PropertiesIcon}
      onClick={() => CalendarActions.openProperties(calendar)} />
    {#if CalendarGroups.isShared(calendar)}
      <MenuDivider />
      <MenuItem label={$t`Delete Calendar`} icon={DeleteIcon}
        onClick={() => CalendarActions.deleteSharedCalendar(calendar)} />
    {/if}
  {/if}
</ContextMenu>

<script lang="ts">
  import type { Calendar } from "../../../logic/Calendar/Calendar";
  import { CalendarActions } from "../CalendarActions";
  import { CalendarGroups } from "./CalendarGroups";
  import ContextMenu from "../../Shared/Menu/ContextMenu.svelte";
  import MenuItem from "../../../frontend/Shared/Menu/MenuItem.svelte";
  import MenuDivider from "../../../frontend/Shared/Menu/MenuDivider.svelte";
  import NewAppointmentIcon from "lucide-svelte/icons/calendar-plus";
  import ShowOnlyIcon from "lucide-svelte/icons/eye";
  import ShareIcon from "lucide-svelte/icons/share-2";
  import ImportIcon from "lucide-svelte/icons/import";
  import PropertiesIcon from "lucide-svelte/icons/settings-2";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import { t } from "../../../l10n/l10n";

  let contextMenu: ContextMenu;
  let calendar: Calendar | null = null;

  export function openFor(event: MouseEvent, forCalendar: Calendar) {
    event.preventDefault();
    calendar = forCalendar;
    contextMenu.onContextMenu(event);
  }
</script>
