{#if withLabel}
  <MenuLabel label={$t`Arrange by`} />
{/if}
{#each arrangements as arrangement}
  <MenuItem label={arrangement.label} checked={$settings.arrangeBy == arrangement.id}
    onClick={() => ViewCommands.arrangeBy(folder, arrangement.id)} />
{/each}
<MenuDivider />
<MenuItem label={$t`Reverse Sort`} checked={$settings.reverseSort} checkable
  onClick={() => ViewCommands.setReverseSort(folder, !$settings.reverseSort)} />
<MenuItem label={$t`Show in Groups`} checked={$settings.showInGroups} checkable
  onClick={() => ViewCommands.setShowInGroups(folder, !$settings.showInGroups)} />
<MenuDivider />
<MenuItem label={$t`View Settings…`} onClick={() => ViewCommands.openViewSettings(folder)} />

<script lang="ts">
  import type { Folder } from "../../../logic/Mail/Folder";
  import { ArrangeFields, MailViewSettings } from "./ViewSettings";
  import { ViewCommands } from "./ViewCommands";
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";
  import MenuLabel from "../../Shared/Menu/MenuLabel.svelte";
  import MenuDivider from "../../Shared/Menu/MenuDivider.svelte";
  import { t } from "../../../l10n/l10n";

  export let folder: Folder | null;
  export let withLabel = false;

  $: settings = MailViewSettings.store(folder);

  const arrangements = ArrangeFields.all();
</script>
