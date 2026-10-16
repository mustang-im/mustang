<RibbonTab label={$t`Insert`}>
  <RibbonGroup label={$t`Include`}>
    <RibbonButton label={$t`Attach File`} icon={AttachIcon} onClick={commands.onAttachFile} />
    <slot name="include" />
  </RibbonGroup>
  {#if commands.onInsertPicture}
    <RibbonGroup label={$t`Illustrations`}>
      <RibbonButton label={$t`Pictures`} icon={PictureIcon}
        disabled={!editor} onClick={commands.onInsertPicture} />
    </RibbonGroup>
  {/if}
  <RibbonGroup label={$t`Links`}>
    <RibbonButton label={$t`Link`} icon={LinkIcon} shortCutInfo="Ctrl+K"
      disabled={!editor} onClick={() => commands.openTool(EditorTool.Link)} />
  </RibbonGroup>
  <RibbonGroup label={$t`Text`}>
    <RibbonButton label={$t`Date & Time`} icon={DateTimeIcon}
      tooltip={$t`Insert the current date or time`}
      disabled={!editor} onClick={() => commands.openTool(EditorTool.DateTime)} />
  </RibbonGroup>
  <RibbonGroup label={$t`Symbols`}>
    <RibbonMenuButton label={$t`Symbol`} icon={SymbolIcon} disabled={!editor}>
      <SymbolGallery {editor} onMoreSymbols={() => commands.openTool(EditorTool.Symbol)} />
    </RibbonMenuButton>
    <RibbonButton label={$t`Horizontal Line`} icon={HorizontalLineIcon} size="small"
      disabled={!editor}
      onClick={() => EditorChain.run(editor, chain => chain.setHorizontalRule())} />
  </RibbonGroup>
  <RibbonGroup label={$t`Emoji`}>
    <RibbonToggleButton label={$t`Emoji`} icon={EmojiIcon}
      disabled={!editor}
      bind:checked={showEmojis} />
  </RibbonGroup>
</RibbonTab>

<script lang="ts">
  import { EditorChain, EditorTool, type EditorCommands } from "./EditorCommands";
  import SymbolGallery from "./SymbolGallery.svelte";
  import RibbonTab from "../Ribbon/RibbonTab.svelte";
  import RibbonGroup from "../Ribbon/RibbonGroup.svelte";
  import RibbonButton from "../Ribbon/RibbonButton.svelte";
  import RibbonToggleButton from "../Ribbon/RibbonToggleButton.svelte";
  import RibbonMenuButton from "../Ribbon/RibbonMenuButton.svelte";
  import AttachIcon from "lucide-svelte/icons/paperclip";
  import PictureIcon from "lucide-svelte/icons/image";
  import LinkIcon from "lucide-svelte/icons/link";
  import DateTimeIcon from "lucide-svelte/icons/calendar-clock";
  import SymbolIcon from "lucide-svelte/icons/omega";
  import HorizontalLineIcon from "lucide-svelte/icons/separator-horizontal";
  import EmojiIcon from "lucide-svelte/icons/smile";
  import { t } from "../../../l10n/l10n";

  export let commands: EditorCommands;
  export let showEmojis = false;

  $: editor = commands.editor;
</script>
