<ContextMenu bind:this={contextMenu}>
  {#if calendar}
    <MenuItem label={$t`Rename Calendar`} icon={RenameIcon}
      onClick={() => renamingCalendar = calendar} />
    {#if CalendarActions.canDeleteCalendar(calendar)}
      <MenuItem label={$t`Delete Calendar`} icon={DeleteIcon}
        onClick={() => CalendarActions.deleteCalendar(calendar)} />
    {/if}
    {#if CalendarSharing.canShare(calendar)}
      <MenuDivider />
      <SubMenu label={$t`Share`} icon={ShareIcon}>
        <MenuItem label={$t`Share Calendar`} icon={ShareIcon}
          onClick={() => $openCalendarProperties = { calendar, tab: "permissions" }} />
        <MenuItem label={$t`Calendar Permissions`} icon={PermissionsIcon}
          onClick={() => $openCalendarProperties = { calendar, tab: "permissions" }} />
      </SubMenu>
    {/if}
    <MenuDivider />
    <SubMenu label={$t`Color`} icon={ColorIcon}>
      <ColorPalette colors={CalendarColors.palette} selected={calendar.color} label={$t`Calendar color`}
        columns={5} onChoose={color => catchErrors(() => CalendarColors.setColor(calendar, color))} />
    </SubMenu>
    <MenuItem label={$t`Overlay`} icon={OverlayIcon} checked={!$splitView.value} checkable
      onClick={toggleOverlay} />
    <MenuItem label={$t`Show Only This Calendar`} icon={ShowOnlyIcon}
      onClick={() => CalendarActions.showOnly(calendar)} />
    <MenuDivider />
    <MenuItem label={$t`Move Up`} icon={MoveUpIcon}
      disabled={!groups.canMove(calendar, -1)}
      onClick={() => CalendarActions.move(calendar, -1)} />
    <MenuItem label={$t`Move Down`} icon={MoveDownIcon}
      disabled={!groups.canMove(calendar, 1)}
      onClick={() => CalendarActions.move(calendar, 1)} />
    <MenuDivider />
    <MenuItem label={$t`Properties…`} icon={PropertiesIcon}
      onClick={() => $openCalendarProperties = { calendar, tab: "general" }} />
  {/if}
</ContextMenu>
{#if renamingCalendar}
  <RenameDialog account={renamingCalendar} title={$t`Rename Calendar`} on:close={() => renamingCalendar = null} />
{/if}

<script lang="ts">
  import type { Calendar } from "../../logic/Calendar/Calendar";
  import { CalendarActions } from "./CalendarActions";
  import { CalendarGroups } from "./FolderPane/CalendarGroups";
  import { CalendarColors } from "./FolderPane/CalendarColors";
  import { CalendarSharing } from "./Dialogs/CalendarSharing";
  import { catchErrors } from "../../frontend/Util/error";
  import { openCalendarProperties } from "./CalendarPropertiesDialog.svelte";
  import ContextMenu from "../Shared/Menu/ContextMenu.svelte";
  import MenuItem from "../Shared/Menu/MenuItem.svelte";
  import MenuDivider from "../Shared/Menu/MenuDivider.svelte";
  import SubMenu from "../Shared/Menu/SubMenu.svelte";
  import ColorPalette from "../Shared/ColorPalette.svelte";
  import RenameDialog from "../Settings/Shared/RenameDialog.svelte";
  import RenameIcon from "lucide-svelte/icons/pencil-line";
  import ShowOnlyIcon from "lucide-svelte/icons/eye";
  import ShareIcon from "lucide-svelte/icons/share-2";
  import PermissionsIcon from "lucide-svelte/icons/user-lock";
  import ColorIcon from "lucide-svelte/icons/palette";
  import PropertiesIcon from "lucide-svelte/icons/file-cog";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import MoveUpIcon from "lucide-svelte/icons/arrow-up";
  import OverlayIcon from "lucide-svelte/icons/layers";
  import { CalendarSettings } from "./CalendarSettings";
  import MoveDownIcon from "lucide-svelte/icons/arrow-down";
  import { appGlobal } from "../../logic/app";
  import { t } from "../../l10n/l10n";

  let contextMenu: ContextMenu;
  let calendar: Calendar | null = null;
  let renamingCalendar: Calendar | null = null;
  let groups: CalendarGroups;
  const splitView = CalendarSettings.splitView;

  function toggleOverlay() {
    CalendarSettings.splitView.value = !CalendarSettings.splitView.value;
  }

  export function openFor(event: MouseEvent, forCalendar: Calendar) {
    event.preventDefault();
    calendar = forCalendar;
    groups = new CalendarGroups(appGlobal.calendars.contents, CalendarGroups.order.value);
    contextMenu.onContextMenu(event);
  }
</script>
