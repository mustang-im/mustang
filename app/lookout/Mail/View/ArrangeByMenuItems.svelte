{#if withLabel}
  <MenuLabel label={$t`Arrange by`} />
{/if}
{#each arrangements as arrangement}
  <MenuItem label={arrangement.label} checked={$settings.arrangeBy == arrangement.id}
    onClick={() => ViewCommands.arrangeBy(folder, arrangement.id)} />
{/each}
{#if withSortOrder}
  <MenuLabel label={$t`Sort order`} />
  {#each sortOrders as order}
    <MenuItem label={order.label} checked={!!$settings.reverseSort == order.reversed}
      onClick={() => ViewCommands.setReverseSort(folder, order.reversed)} />
  {/each}
{/if}
<MenuDivider />
{#if !withSortOrder}
  <MenuItem label={$t`Reverse Sort`} checked={$settings.reverseSort} checkable
    onClick={() => ViewCommands.setReverseSort(folder, !$settings.reverseSort)} />
{/if}
<MenuItem label={$t`Show in Groups`} checked={$settings.showInGroups} checkable
  onClick={() => ViewCommands.setShowInGroups(folder, !$settings.showInGroups)} />
<MenuDivider />
<MenuItem label={$t`View Settings…`} onClick={() => ViewCommands.openViewSettings(folder)} />

<script lang="ts">
  import type { Folder } from "../../../logic/Mail/Folder";
  import { ArrangeFields, MailViewSettings } from "./ViewSettings";
  import { ViewCommands } from "./ViewCommands";
  import { MessageGrouping } from "../MessageList/MessageGrouping";
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";
  import MenuLabel from "../../Shared/Menu/MenuLabel.svelte";
  import MenuDivider from "../../Shared/Menu/MenuDivider.svelte";
  import { t } from "../../../l10n/l10n";

  export let folder: Folder | null;
  export let withLabel = false;
  export let withSortOrder = false;

  $: settings = MailViewSettings.store(folder);
  $: sortOrders = MessageGrouping.sortOrders($settings.arrangeBy);

  const arrangements = ArrangeFields.all();
</script>
