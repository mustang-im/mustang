<MenuLabel label={$t`Sort by`} />
{#each arrangements as arrangement}
  <MenuItem label={arrangement.label} checkable checked={$settings.arrangeBy == arrangement.id}
    onClick={() => ViewCommands.arrangeBy(folder, arrangement.id)} />
{/each}
<MenuLabel label={$t`Sort order`} />
{#each sortOrders as order}
  <MenuItem label={order.label} checkable checked={!!$settings.reverseSort == order.reversed}
    onClick={() => ViewCommands.setReverseSort(folder, order.reversed)} />
{/each}

<script lang="ts">
  import type { Folder } from "../../../logic/Mail/Folder";
  import { ArrangeFields, MailViewSettings } from "./ViewSettings";
  import { ViewCommands } from "./ViewCommands";
  import { MessageGrouping } from "../MessageList/MessageGrouping";
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";
  import MenuLabel from "../../Shared/Menu/MenuLabel.svelte";
  import { t } from "../../../l10n/l10n";

  export let folder: Folder | null;

  const arrangements = ArrangeFields.all();

  $: settings = MailViewSettings.store(folder);
  $: sortOrders = MessageGrouping.sortOrders($settings.arrangeBy);
</script>
