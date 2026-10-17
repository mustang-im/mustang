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
      onClick={() => MailViewSettings.change(folder, { reverseSort: order.reversed })} />
  {/each}
{/if}
<MenuDivider />
{#if !withSortOrder}
  <MenuItem label={$t`Reverse Sort`} checked={$settings.reverseSort} checkable
    onClick={() => MailViewSettings.change(folder, { reverseSort: !$settings.reverseSort })} />
{/if}
<MenuItem label={$t`Show in Groups`} checked={$settings.showInGroups} checkable
  onClick={() => MailViewSettings.change(folder, { showInGroups: !$settings.showInGroups })} />
<MenuDivider />
<MenuItem label={$t`View Settings…`} onClick={() => { $openViewSettings = { folder }; }} />

<script lang="ts">
  import type { Folder } from "../../../logic/Mail/Folder";
  import { ArrangeFields, MailViewSettings } from "./ViewSettings";
  import { ViewCommands } from "../View/ViewCommands";
  import { openViewSettings } from "./ViewSettingsDialog.svelte";
  import { MessageGrouping } from "../3pane/MessageGrouping";
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
