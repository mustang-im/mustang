{#if single}
  <MenuItem label={$t`Reply`} icon={ReplyIcon} shortCutInfo="Ctrl+R"
    onClick={() => MessageActions.reply(single)} />
  <MenuItem label={$t`Reply All`} icon={ReplyAllIcon} shortCutInfo="Ctrl+Shift+R"
    disabled={!MessageActions.canReplyAll(single) && $t`There are no other recipients`}
    onClick={() => MessageActions.replyAll(single)} />
  <MenuItem label={$t`Forward`} icon={ForwardIcon} shortCutInfo="Ctrl+F"
    onClick={event => MessageActions.forward(single, event as MouseEvent)} />
  <MenuDivider />
{/if}
{#if allRead}
  <MenuItem label={$t`Mark as Unread`} icon={UnreadIcon} shortCutInfo="Ctrl+U"
    onClick={() => MessageActions.markRead(messages, false)} />
{:else}
  <MenuItem label={$t`Mark as Read`} icon={ReadIcon} shortCutInfo="Ctrl+Q"
    onClick={() => MessageActions.markRead(messages, true)} />
{/if}
<SubMenuItem label={$t`Categorize`} icon={CategorizeIcon}>
  <CategorizeMenuItems {messages} />
</SubMenuItem>
{#if allFlagged}
  <MenuItem label={$t`Clear Flag`} icon={ClearFlagIcon}
    onClick={() => MessageActions.flag(messages, false)} />
{:else}
  <MenuItem label={$t`Flag Message`} icon={FlagIcon} shortCutInfo="Insert"
    onClick={() => MessageActions.flag(messages, true)} />
{/if}
<MenuDivider />
{#if single}
  <SubMenuItem label={$t`Rules`} icon={RulesIcon}>
    <RulesMenuItems message={single} account={single.folder?.account} />
  </SubMenuItem>
{/if}
<SubMenuItem label={$t`Move`} icon={MoveIcon}>
  <MoveMenuItems {messages} />
</SubMenuItem>
<MenuDivider />
<MenuItem label={$t`Delete`} icon={DeleteIcon} shortCutInfo="Del"
  onClick={() => MessageActions.delete(messages)} />
<MenuItem label={$t`Archive`} icon={ArchiveIcon} shortCutInfo="Backspace"
  onClick={() => MessageActions.archive(messages)} />
{#if allJunk}
  <MenuItem label={$t`Not Junk`} icon={NotJunkIcon} shortCutInfo="Ctrl+Alt+J"
    onClick={() => MessageActions.junk(messages, false)} />
{:else}
  <MenuItem label={$t`Junk`} icon={JunkIcon}
    tooltip={$t`Move to the Junk folder, and train the junk filter`}
    onClick={() => MessageActions.junk(messages, true)} />
{/if}
{#if single}
  <MenuDivider />
  <MenuItem label={$t`Quick Print`} icon={PrintIcon} shortCutInfo="Ctrl+P"
    onClick={() => MessageActions.print(single)} />
  <MenuItem label={$t`Save As…`} icon={SaveIcon}
    onClick={() => MessageActions.saveAs(single)} />
  <MenuItem label={MessageActions.isViewingSource() ? $t`View Message` : $t`View Source`} icon={SourceIcon}
    onClick={() => MessageActions.toggleSource()} />
{/if}

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import { MessageActions } from "../MessageActions";
  import { SelectionState } from "../SelectionState";
  import SubMenuItem from "../Menu/SubMenuItem.svelte";
  import CategorizeMenuItems from "../Menu/CategorizeMenuItems.svelte";
  import MoveMenuItems from "../Menu/MoveMenuItems.svelte";
  import RulesMenuItems from "../Menu/RulesMenuItems.svelte";
  import MenuItem from "../../../frontend/Shared/Menu/MenuItem.svelte";
  import MenuDivider from "../../../frontend/Shared/Menu/MenuDivider.svelte";
  import ReplyIcon from "lucide-svelte/icons/reply";
  import ReplyAllIcon from "lucide-svelte/icons/reply-all";
  import ForwardIcon from "lucide-svelte/icons/forward";
  import ReadIcon from "lucide-svelte/icons/mail-open";
  import UnreadIcon from "lucide-svelte/icons/mail";
  import CategorizeIcon from "lucide-svelte/icons/tag";
  import FlagIcon from "lucide-svelte/icons/flag";
  import ClearFlagIcon from "lucide-svelte/icons/flag-off";
  import RulesIcon from "lucide-svelte/icons/list-filter";
  import MoveIcon from "lucide-svelte/icons/folder-input";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import ArchiveIcon from "lucide-svelte/icons/archive";
  import JunkIcon from "lucide-svelte/icons/shield-x";
  import NotJunkIcon from "lucide-svelte/icons/shield-check";
  import PrintIcon from "lucide-svelte/icons/printer";
  import SaveIcon from "lucide-svelte/icons/save";
  import SourceIcon from "lucide-svelte/icons/code-xml";
  import { t } from "../../../l10n/l10n";

  export let messages: EMail[];

  $: single = messages.length == 1 ? messages[0] : null;
  $: allRead = SelectionState.allRead(messages);
  $: allFlagged = SelectionState.allFlagged(messages);
  $: allJunk = MessageActions.isJunk(messages);
</script>
