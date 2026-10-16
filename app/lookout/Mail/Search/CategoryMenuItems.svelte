{#each $tags.each as tag (tag)}
  <MenuItem label={tag.name} checkable checked={selected.includes(tag)} {keepOpen} onClick={() => onToggle(tag)}>
    <CategorySquare slot="icon" color={tag.color} state={selected.includes(tag) ? TagState.All : TagState.None} />
  </MenuItem>
{:else}
  <MenuLabel label={$t`No categories yet`} />
{/each}

<script lang="ts">
  import { availableTags, type Tag } from "../../../logic/Abstract/Tag";
  import { TagState } from "../SelectionState";
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";
  import MenuLabel from "../../Shared/Menu/MenuLabel.svelte";
  import CategorySquare from "../Categories/CategorySquare.svelte";
  import { t } from "../../../l10n/l10n";

  export let selected: Tag[];
  export let onToggle: (tag: Tag) => void;
  export let keepOpen = false;

  const tags = availableTags;
</script>
