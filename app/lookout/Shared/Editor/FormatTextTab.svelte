<RibbonTab label={$t`Format Text`}>
  <RibbonGroup label={$t`Clipboard`} icon={PasteIcon}>
    <RibbonSplitButton label={$t`Paste`} icon={PasteIcon} shortCutInfo={$t`Ctrl+V`}
      disabled={!editor} onClick={() => pasteClipboard(editor)}>
      <MenuItem label={$t`Keep Source Formatting`} icon={PasteIcon} onClick={() => pasteClipboard(editor)} />
      <MenuItem label={$t`Keep Text Only`} icon={PasteTextIcon} onClick={() => pasteClipboardAsText(editor)} />
    </RibbonSplitButton>
    <RibbonButton label={$t`Cut`} icon={CutIcon} size="small" shortCutInfo={$t`Ctrl+X`}
      disabled={!editor} onClick={() => cutSelection(editor)} />
    <RibbonButton label={$t`Copy`} icon={CopyIcon} size="small" shortCutInfo={$t`Ctrl+C`}
      disabled={!editor} onClick={() => copySelection(editor)} />
  </RibbonGroup>
  <RibbonGroup label={$t`Font`} icon={BoldIcon}>
    <RibbonButtonRow label={$t`Font style`}>
      <RibbonToggleButton label={$t`Bold`} icon={BoldIcon} shortCutInfo={$t`Ctrl+B`}
        selected={!!editor?.isActive("bold")} disabled={!editor}
        onClick={() => run(chain => chain.toggleBold())} />
      <RibbonToggleButton label={$t`Italic`} icon={ItalicIcon} shortCutInfo={$t`Ctrl+I`}
        selected={!!editor?.isActive("italic")} disabled={!editor}
        onClick={() => run(chain => chain.toggleItalic())} />
      <RibbonToggleButton label={$t`Underline`} icon={UnderlineIcon} shortCutInfo={$t`Ctrl+U`}
        selected={!!editor?.isActive("underline")} disabled={!editor}
        onClick={() => run(chain => chain.toggleUnderline())} />
      <RibbonToggleButton label={$t`Strikethrough`} icon={StrikethroughIcon}
        selected={!!editor?.isActive("strike")} disabled={!editor}
        onClick={() => run(chain => chain.toggleStrike())} />
      <RibbonToggleButton label={$t`Code`} icon={CodeIcon}
        tooltip={$t`Code word, within a phrase`}
        selected={!!editor?.isActive("code")} disabled={!editor}
        onClick={() => run(chain => chain.toggleCode())} />
    </RibbonButtonRow>
    <RibbonButtonRow label={$t`Clear`}>
      <RibbonButton label={$t`Clear Formatting`} icon={ClearFormattingIcon}
        disabled={!editor}
        onClick={() => run(chain => chain.clearNodes().unsetAllMarks())} />
    </RibbonButtonRow>
  </RibbonGroup>
  <RibbonGroup label={$t`Paragraph`} icon={BulletsIcon}>
    <RibbonButtonRow label={$t`Lists`}>
      <RibbonToggleButton label={$t`Bullets`} icon={BulletsIcon}
        selected={!!editor?.isActive("bulletList")} disabled={!editor}
        onClick={() => run(chain => chain.toggleBulletList())} />
      <RibbonToggleButton label={$t`Numbering`} icon={NumberingIcon}
        selected={!!editor?.isActive("orderedList")} disabled={!editor}
        onClick={() => run(chain => chain.toggleOrderedList())} />
      <RibbonButton label={$t`Decrease Indent`} icon={OutdentIcon}
        disabled={!editor?.can().liftListItem("listItem") && $t`Only list items can be indented`}
        onClick={() => run(chain => chain.liftListItem("listItem"))} />
      <RibbonButton label={$t`Increase Indent`} icon={IndentIcon}
        disabled={!editor?.can().sinkListItem("listItem") && $t`Only list items can be indented`}
        onClick={() => run(chain => chain.sinkListItem("listItem"))} />
    </RibbonButtonRow>
    <RibbonButtonRow label={$t`Quote`}>
      <RibbonToggleButton label={$t`Quote`} icon={QuoteIcon}
        tooltip={$t`Quote of the original email`}
        selected={!!editor?.isActive("blockquote")} disabled={!editor}
        onClick={() => run(chain => chain.toggleBlockquote())} />
    </RibbonButtonRow>
  </RibbonGroup>
  <RibbonGroup label={$t`Styles`}>
    <RibbonMenuButton label={$t`Styles`} icon={StylesIcon} disabled={!editor}>
      <MenuItem label={$t`Normal`} icon={NormalIcon}
        checked={!!editor?.isActive("paragraph")}
        onClick={() => run(chain => chain.setParagraph())} />
      <MenuItem label={$t`Heading 1`} icon={Heading1Icon}
        checked={!!editor?.isActive("heading", { level: 1 })}
        onClick={() => run(chain => chain.toggleHeading({ level: 1 }))} />
      <MenuItem label={$t`Heading 2`} icon={Heading2Icon}
        checked={!!editor?.isActive("heading", { level: 2 })}
        onClick={() => run(chain => chain.toggleHeading({ level: 2 }))} />
      <MenuItem label={$t`Heading 3`} icon={Heading3Icon}
        checked={!!editor?.isActive("heading", { level: 3 })}
        onClick={() => run(chain => chain.toggleHeading({ level: 3 }))} />
      <MenuDivider />
      <MenuItem label={$t`Code Block`} icon={CodeBlockIcon}
        checked={!!editor?.isActive("codeBlock")}
        onClick={() => run(chain => chain.toggleCodeBlock())} />
    </RibbonMenuButton>
  </RibbonGroup>
  <RibbonGroup label={$t`Editing`} icon={FindIcon}>
    <RibbonButton label={$t`Find`} icon={FindIcon} size="small" shortCutInfo="F4"
      disabled={!editor} onClick={() => { openedTool = EditorTool.Find; }} />
    <RibbonButton label={$t`Replace`} icon={ReplaceIcon} size="small" shortCutInfo={$t`Ctrl+H`}
      disabled={!editor} onClick={() => { openedTool = EditorTool.Replace; }} />
    <RibbonMenuButton label={$t`Select`} icon={SelectIcon} size="small" disabled={!editor}>
      <MenuItem label={$t`Select All`} icon={SelectAllIcon} shortCutInfo={$t`Ctrl+A`}
        onClick={() => run(chain => chain.selectAll())} />
    </RibbonMenuButton>
  </RibbonGroup>
</RibbonTab>

<script lang="ts">
  import { EditorTool } from "./EditorTool";
  import { cutSelection, copySelection, pasteClipboard, pasteClipboardAsText } from "./EditorClipboard";
  import RibbonTab from "../Ribbon/RibbonTab.svelte";
  import RibbonGroup from "../Ribbon/RibbonGroup.svelte";
  import RibbonButton from "../Ribbon/RibbonButton.svelte";
  import RibbonToggleButton from "../Ribbon/RibbonToggleButton.svelte";
  import RibbonMenuButton from "../Ribbon/RibbonMenuButton.svelte";
  import RibbonSplitButton from "../Ribbon/RibbonSplitButton.svelte";
  import RibbonButtonRow from "../Ribbon/RibbonButtonRow.svelte";
  import MenuItem from "../Menu/MenuItem.svelte";
  import MenuDivider from "../Menu/MenuDivider.svelte";
  import BoldIcon from "lucide-svelte/icons/bold";
  import ItalicIcon from "lucide-svelte/icons/italic";
  import UnderlineIcon from "lucide-svelte/icons/underline";
  import StrikethroughIcon from "lucide-svelte/icons/strikethrough";
  import CodeIcon from "lucide-svelte/icons/code";
  import BulletsIcon from "lucide-svelte/icons/list";
  import NumberingIcon from "lucide-svelte/icons/list-ordered";
  import ClearFormattingIcon from "lucide-svelte/icons/remove-formatting";
  import QuoteIcon from "lucide-svelte/icons/text-quote";
  import StylesIcon from "lucide-svelte/icons/heading";
  import NormalIcon from "lucide-svelte/icons/pilcrow";
  import Heading1Icon from "lucide-svelte/icons/heading-1";
  import Heading2Icon from "lucide-svelte/icons/heading-2";
  import Heading3Icon from "lucide-svelte/icons/heading-3";
  import CodeBlockIcon from "lucide-svelte/icons/square-code";
  import PasteIcon from "lucide-svelte/icons/clipboard-paste";
  import PasteTextIcon from "lucide-svelte/icons/clipboard-type";
  import CutIcon from "lucide-svelte/icons/scissors";
  import CopyIcon from "lucide-svelte/icons/copy";
  import OutdentIcon from "lucide-svelte/icons/list-indent-decrease";
  import IndentIcon from "lucide-svelte/icons/list-indent-increase";
  import FindIcon from "lucide-svelte/icons/search";
  import ReplaceIcon from "lucide-svelte/icons/replace";
  import SelectIcon from "lucide-svelte/icons/text-select";
  import SelectAllIcon from "lucide-svelte/icons/square-dashed-mouse-pointer";
  import { t } from "../../../l10n/l10n";
  import type { ChainedCommands, Editor } from "@tiptap/core";

  export let editor: Editor = null;
  export let openedTool: EditorTool | null = null;


  function run(command: (chain: ChainedCommands) => ChainedCommands) {
    command(editor.chain().focus()).run();
  }
</script>
