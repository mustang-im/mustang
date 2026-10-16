<ContextMenu bind:this={contextMenu}>
  {#if calendar}
    <MenuItem label={$t`Rename Calendar`} icon={RenameIcon}
      onClick={() => CalendarActions.rename(calendar)} />
    {#if CalendarGroups.isShared(calendar)}
      <MenuItem label={$t`Delete Calendar`} icon={DeleteIcon}
        onClick={() => CalendarActions.deleteSharedCalendar(calendar)} />
    {/if}
    {#if CalendarSharing.canShare(calendar)}
      <MenuDivider />
      <SubMenu label={$t`Share`} icon={ShareIcon}>
        <MenuItem label={$t`Share Calendar`} icon={ShareIcon}
          onClick={() => CalendarActions.openSharing(calendar)} />
        <MenuItem label={$t`Calendar Permissions`} icon={PermissionsIcon}
          onClick={() => CalendarActions.openSharing(calendar)} />
      </SubMenu>
    {/if}
    <MenuDivider />
    <SubMenu label={$t`Color`} icon={ColorIcon}>
      <ColorPalette colors={CalendarColors.palette} selected={calendar.color} label={$t`Calendar color`}
        columns={5} onChoose={color => catchErrors(() => CalendarColors.setColor(calendar, color))} />
    </SubMenu>
    <MenuItem label={$t`Show Only This Calendar`} icon={ShowOnlyIcon}
      onClick={() => CalendarActions.showOnly(calendar)} />
    <MenuDivider />
    <MenuItem label={$t`Properties…`} icon={PropertiesIcon}
      onClick={() => CalendarActions.openProperties(calendar)} />
  {/if}
</ContextMenu>

<script lang="ts">
  import type { Calendar } from "../../../logic/Calendar/Calendar";
  import { CalendarActions } from "../CalendarActions";
  import { CalendarGroups } from "./CalendarGroups";
  import { CalendarColors } from "./CalendarColors";
  import { CalendarSharing } from "../Dialogs/CalendarSharing";
  import { catchErrors } from "../../../frontend/Util/error";
  import ContextMenu from "../../Shared/Menu/ContextMenu.svelte";
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";
  import MenuDivider from "../../Shared/Menu/MenuDivider.svelte";
  import SubMenu from "../../Shared/Menu/SubMenu.svelte";
  import ColorPalette from "../../Shared/ColorPalette.svelte";
  import RenameIcon from "lucide-svelte/icons/pencil-line";
  import ShowOnlyIcon from "lucide-svelte/icons/eye";
  import ShareIcon from "lucide-svelte/icons/share-2";
  import PermissionsIcon from "lucide-svelte/icons/user-lock";
  import ColorIcon from "lucide-svelte/icons/palette";
  import PropertiesIcon from "lucide-svelte/icons/file-cog";
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
