<MenuItem label={$t`Clear All Categories`} icon={ClearIcon}
  disabled={!hasAnyTag && $t`The selected messages have no categories`}
  onClick={() => MessageActions.clearTags(messages)} />
<MenuDivider />
{#each $tags.each as tag (tag)}
  {@const state = SelectionState.tagState(messages, tag)}
  <MenuItem label={tag.name} selected={state == TagState.All}
    onClick={() => MessageActions.toggleTag(messages, tag)}>
    <CategorySquare slot="icon" color={tag.color} {state} />
  </MenuItem>
{:else}
  <MenuLabel label={$t`No categories yet`} />
{/each}
<MenuDivider />
<MenuItem label={$t`All Categories…`} icon={AllCategoriesIcon}
  onClick={() => MailDialogs.open({ kind: "color-categories" })} />

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import { availableTags } from "../../../logic/Abstract/Tag";
  import { MessageActions } from "../MessageActions";
  import { SelectionState, TagState } from "../SelectionState";
  import { MailDialogs } from "../Dialogs/MailDialogs";
  import MenuItem from "../../../frontend/Shared/Menu/MenuItem.svelte";
  import MenuLabel from "../../../frontend/Shared/Menu/MenuLabel.svelte";
  import MenuDivider from "../../../frontend/Shared/Menu/MenuDivider.svelte";
  import ClearIcon from "lucide-svelte/icons/eraser";
  import AllCategoriesIcon from "lucide-svelte/icons/tags";
  import CategorySquare from "./CategorySquare.svelte";
  import { t } from "../../../l10n/l10n";

  export let messages: EMail[];

  const tags = availableTags;
  $: hasAnyTag = messages.some(message => message.tags.hasItems);
</script>
