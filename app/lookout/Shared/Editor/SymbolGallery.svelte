<grid class="gallery" role="group" aria-label={$t`Symbol`}>
  {#each SymbolTable.gallery() as character (character)}
    <button type="button" class="symbol" role="menuitem" title={"U+" + SymbolTable.characterCode(character)}
      disabled={!editor}
      on:click={() => onInsert(character)}>
      {character}
    </button>
  {/each}
</grid>
<MenuDivider />
<MenuItem label={$t`More Symbols…`} disabled={!editor} onClick={onMoreSymbols} />

<script lang="ts">
  import { SymbolTable } from "./SymbolTable";
  import MenuItem from "../Menu/MenuItem.svelte";
  import MenuDivider from "../Menu/MenuDivider.svelte";
  import type { Editor } from "@tiptap/core";
  import { getContext } from "svelte";
  import { t } from "../../../l10n/l10n";

  export let editor: Editor;
  export let onMoreSymbols: () => void;

  const closeMenu = getContext<() => void>("onMenuClose");

  function onInsert(character: string) {
    editor.chain().focus().insertContent({ type: "text", text: character }).run();
    SymbolTable.used(character);
    closeMenu?.();
  }
</script>

<style>
  .gallery {
    grid-template-columns: repeat(5, 36px);
    grid-auto-rows: 36px;
    gap: 2px;
    padding: 4px 8px;
  }
  .symbol {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 1px solid transparent;
    border-radius: var(--lo-radius-small);
    background: none;
    color: var(--lo-fg);
    font-size: 18px;
  }
  .symbol:hover:not(:disabled) {
    background-color: var(--lo-hover-bg);
    border-color: var(--lo-border);
  }
</style>
