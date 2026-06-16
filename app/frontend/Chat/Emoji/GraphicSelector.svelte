<hbox class="graphic-selector" flex>
  <vbox class="type-selector">
    <RoundButton
      label={$t`Emoji`}
      onClick={() => showGraphicType = GraphicType.Emoji}
      icon={EmojiIcon}
      border={false} classes="plain"
      />
    <RoundButton
      label={$t`GIF`}
      icon={GIFIcon}
      border={false} classes="plain"
      >
      <hbox slot="icon font-smallest">GIF</hbox>
    </RoundButton>
    <RoundButton
      label={$t`Sticker`}
      icon={StickerIcon}
      border={false} classes="plain"
      />
    <hbox flex />
    <RoundButton
      label={$t`Delete last`}
      icon={BackspaceIcon}
      border={false} classes="plain"
      onClick={() => dispatchEvent("backspace")}
      />
  </vbox>

  <vbox flex>
    <hbox class="search">
      <SearchField bind:searchTerm />
    </hbox>

    {#if showGraphicType == GraphicType.Emoji}
      <EmojiSelector {searchTerm} on:select />
    {:else if showGraphicType == GraphicType.GIF}
      <GIFPicker {searchTerm} />
    {:else if showGraphicType == GraphicType.Sticker}
      <StickerPicker {searchTerm} />
    {/if}
  </vbox>
</hbox>

<script lang="ts">
  import EmojiSelector from "./EmojiSelector.svelte";
  import GIFPicker from "./GIFPicker.svelte";
  import StickerPicker from "./StickerPicker.svelte";
  import SearchField from "../../Shared/SearchField.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import Button from "../../Shared/Button.svelte";
  import EmojiIcon from "lucide-svelte/icons/smile";
  import GIFIcon from "lucide-svelte/icons/bird";
  import StickerIcon from "lucide-svelte/icons/heart";
  import BackspaceIcon from "lucide-svelte/icons/delete";
  import CollapseIcon from "lucide-svelte/icons/chevron-down";
  import { t } from "../../../l10n/l10n";
  import { createEventDispatcher } from 'svelte';
  const dispatchEvent = createEventDispatcher<{ backspace: void }>();

  /** in/out */
  export let isOpen: boolean;

  let searchTerm: string | null;

  enum GraphicType {
    Emoji,
    GIF,
    Sticker,
  };
  let showGraphicType = GraphicType.Emoji;
</script>

<style>
  .search {
    margin: 4px 8px 8px 56px;
  }
</style>