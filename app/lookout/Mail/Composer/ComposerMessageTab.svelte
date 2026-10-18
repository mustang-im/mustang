<RibbonTab label={$t`Message`} contextual={isInline} isSelected={isInline}>
  <RibbonGroup label={$t`Clipboard`} icon={PasteIcon}>
    <RibbonSplitButton label={$t`Paste`} icon={PasteIcon} shortCutInfo="Ctrl+V"
      disabled={!editor} onClick={() => EditorClipboard.paste(editor)}>
      <MenuItem label={$t`Keep Source Formatting`} icon={PasteIcon} onClick={() => EditorClipboard.paste(editor)} />
      <MenuItem label={$t`Keep Text Only`} icon={PasteTextIcon} onClick={() => EditorClipboard.pasteAsText(editor)} />
    </RibbonSplitButton>
    <RibbonButton label={$t`Cut`} icon={CutIcon} size="small" shortCutInfo="Ctrl+X"
      disabled={!editor} onClick={() => EditorClipboard.cut(editor)} />
    <RibbonButton label={$t`Copy`} icon={CopyIcon} size="small" shortCutInfo="Ctrl+C"
      disabled={!editor} onClick={() => EditorClipboard.copy(editor)} />
  </RibbonGroup>
  <RibbonGroup label={$t`Basic Text`} icon={BoldIcon}>
    <RibbonButtonRow label={$t`Font style`}>
      <RibbonToggleButton label={$t`Bold`} icon={BoldIcon} shortCutInfo="Ctrl+B"
        checked={!!editor?.isActive("bold")} disabled={!editor}
        onChange={() => run(chain => chain.toggleBold())} />
      <RibbonToggleButton label={$t`Italic`} icon={ItalicIcon} shortCutInfo="Ctrl+I"
        checked={!!editor?.isActive("italic")} disabled={!editor}
        onChange={() => run(chain => chain.toggleItalic())} />
      <RibbonToggleButton label={$t`Underline`} icon={UnderlineIcon} shortCutInfo="Ctrl+U"
        checked={!!editor?.isActive("underline")} disabled={!editor}
        onChange={() => run(chain => chain.toggleUnderline())} />
      <RibbonToggleButton label={$t`Strikethrough`} icon={StrikethroughIcon}
        checked={!!editor?.isActive("strike")} disabled={!editor}
        onChange={() => run(chain => chain.toggleStrike())} />
    </RibbonButtonRow>
    <RibbonButtonRow label={$t`Paragraph`}>
      <RibbonToggleButton label={$t`Bullets`} icon={BulletsIcon}
        checked={!!editor?.isActive("bulletList")} disabled={!editor}
        onChange={() => run(chain => chain.toggleBulletList())} />
      <RibbonToggleButton label={$t`Numbering`} icon={NumberingIcon}
        checked={!!editor?.isActive("orderedList")} disabled={!editor}
        onChange={() => run(chain => chain.toggleOrderedList())} />
      <RibbonButton label={$t`Decrease Indent`} icon={OutdentIcon}
        disabled={!editor?.can().liftListItem("listItem") && $t`Only list items can be indented`}
        onClick={() => run(chain => chain.liftListItem("listItem"))} />
      <RibbonButton label={$t`Increase Indent`} icon={IndentIcon}
        disabled={!editor?.can().sinkListItem("listItem") && $t`Only list items can be indented`}
        onClick={() => run(chain => chain.sinkListItem("listItem"))} />
      <RibbonButton label={$t`Clear Formatting`} icon={ClearFormattingIcon}
        disabled={!editor}
        onClick={() => run(chain => chain.clearNodes().unsetAllMarks())} />
    </RibbonButtonRow>
  </RibbonGroup>
  <RibbonGroup label={$t`Names`}>
    <RibbonButton label={$t`Address Book`} icon={AddressBookIcon}
      onClick={() => { $openSelectNames = { mail, field: RecipientField.To }; }} />
    <RibbonButton label={$t`Check Names`} icon={CheckNamesIcon}
      tooltip={$t`Check the names you typed in the To, Cc and Bcc boxes against your address books`}
      onClick={() => { $checkNamesOf = mail; }} />
  </RibbonGroup>
  <RibbonGroup label={$t`Include`} icon={AttachIcon}>
    <RibbonButton label={$t`Attach File`} icon={AttachIcon} size="small" onClick={onAddAttachment} />
    <RibbonButton label={$t`Link`} icon={LinkIcon} size="small" shortCutInfo="Ctrl+K"
      disabled={!editor} onClick={() => { $openEditorTool = { mail, tool: EditorTool.Link }; }} />
    <RibbonMenuButton label={$t`Signature`} icon={SignatureIcon} size="small">
      <SignatureMenuItems {identity} {editor} onSignatures={() => { $openSignatures = mail; }} />
    </RibbonMenuButton>
  </RibbonGroup>
  {#if isInline}
    <ShowFieldsGroup {mail} />
    <EncryptionButtons {mail} {identity} />
  {/if}
  <RibbonGroup label={$t`Editor`}>
    <RibbonToggleButton label={$t`Spelling`} icon={SpellingIcon}
      tooltip={$t`Check spelling while typing`}
      bind:checked={$spellcheck.value} />
  </RibbonGroup>
</RibbonTab>
<FileSelector bind:this={fileSelector} />

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import { addFilesAsAttachments } from "../../../logic/Abstract/Attachment";
  import { EditorTool } from "../../Shared/Editor/EditorTool";
  import { getLocalStorage } from "../../../frontend/Util/LocalStorage";
  import { EditorClipboard } from "../../Shared/Editor/EditorClipboard";
  import RibbonTab from "../../Shared/Ribbon/RibbonTab.svelte";
  import RibbonGroup from "../../Shared/Ribbon/RibbonGroup.svelte";
  import RibbonButton from "../../Shared/Ribbon/RibbonButton.svelte";
  import RibbonToggleButton from "../../Shared/Ribbon/RibbonToggleButton.svelte";
  import RibbonMenuButton from "../../Shared/Ribbon/RibbonMenuButton.svelte";
  import RibbonSplitButton from "../../Shared/Ribbon/RibbonSplitButton.svelte";
  import RibbonButtonRow from "../../Shared/Ribbon/RibbonButtonRow.svelte";
  import { checkNamesOf, openEditorTool } from "./MailComposer.svelte";
  import { openSelectNames, RecipientField } from "./SelectNamesDialog.svelte";
  import { openSignatures } from "./SignaturesDialog.svelte";
  import SignatureMenuItems from "./SignatureMenuItems.svelte";
  import ShowFieldsGroup from "./ShowFieldsGroup.svelte";
  import EncryptionButtons from "./EncryptionButtons.svelte";
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";
  import FileSelector from "../../../frontend/Mail/Composer/Attachments/FileSelector.svelte";
  import BoldIcon from "lucide-svelte/icons/bold";
  import ItalicIcon from "lucide-svelte/icons/italic";
  import UnderlineIcon from "lucide-svelte/icons/underline";
  import StrikethroughIcon from "lucide-svelte/icons/strikethrough";
  import BulletsIcon from "lucide-svelte/icons/list";
  import NumberingIcon from "lucide-svelte/icons/list-ordered";
  import ClearFormattingIcon from "lucide-svelte/icons/remove-formatting";
  import AddressBookIcon from "lucide-svelte/icons/book-user";
  import AttachIcon from "lucide-svelte/icons/paperclip";
  import LinkIcon from "lucide-svelte/icons/link";
  import SpellingIcon from "lucide-svelte/icons/spell-check";
  import SignatureIcon from "lucide-svelte/icons/pen-line";
  import PasteIcon from "lucide-svelte/icons/clipboard-paste";
  import PasteTextIcon from "lucide-svelte/icons/clipboard-type";
  import CutIcon from "lucide-svelte/icons/scissors";
  import CopyIcon from "lucide-svelte/icons/copy";
  import OutdentIcon from "lucide-svelte/icons/list-indent-decrease";
  import IndentIcon from "lucide-svelte/icons/list-indent-increase";
  import CheckNamesIcon from "lucide-svelte/icons/user-check";
  import { t } from "../../../l10n/l10n";
  import type { ChainedCommands, Editor } from "@tiptap/core";

  export let mail: EMail;
  export let editor: Editor | null;
  export let isInline = false;

  const spellcheck = getLocalStorage<boolean>("mail.send.spellcheck.enabled", false);
  $: identity = mail.identity;

  function run(command: (chain: ChainedCommands) => ChainedCommands) {
    command(editor.chain().focus()).run();
  }

  /* <copied from="../../../frontend/Mail/Composer/MailComposer.svelte"> */
  let fileSelector: FileSelector;
  async function onAddAttachment() {
    let files = await fileSelector.selectFiles();
    if (!files?.length) {
      return;
    }
    addFilesAsAttachments(mail, files);
  }
  /* </copied> */
</script>
