<RibbonTab label={$t`Home`}>
  <RibbonGroup label={$t`New`}>
    <RibbonButton label={$t`New Email`} icon={NewMailIcon}
      onClick={() => MessageActions.newMail(folder)}
      disabled={!$accounts.hasItems && $t`Please set up a mail account first`}
      shortCutInfo="Ctrl+N" />
    <RibbonMenuButton label={$t`New Items`} icon={NewItemsIcon}>
      <MenuItem label={$t`Email Message`} icon={NewMailIcon} onClick={() => MessageActions.newMail(folder)} />
      <MenuItem label={$t`Appointment`} icon={AppointmentIcon} onClick={() => MessageActions.newAppointment()} />
      <MenuItem label={$t`Meeting`} icon={MeetingIcon} onClick={() => MessageActions.newMeeting()} />
      <MenuItem label={$t`Contact`} icon={ContactIcon} onClick={() => MessageActions.newContact()} />
    </RibbonMenuButton>
  </RibbonGroup>
  <RibbonGroup label={$t`Delete`}>
    <RibbonButton label={$t`Delete`} icon={DeleteIcon}
      onClick={() => MessageActions.delete(messages)}
      disabled={noSelection} shortCutInfo="Del" />
    <RibbonButton label={$t`Archive`} icon={ArchiveIcon}
      onClick={() => MessageActions.archive(messages)}
      disabled={noSelection} shortCutInfo="Backspace" />
    <RibbonMenuButton label={$t`Junk`} icon={JunkIcon} disabled={noSelection}>
      <MenuItem label={$t`Junk`} icon={JunkIcon}
        tooltip={$t`Move to the Junk folder, and train the junk filter`}
        disabled={isJunk && $t`The selected messages are already junk`}
        onClick={() => MessageActions.junk(messages, true)} />
      <MenuItem label={$t`Not Junk`} icon={NotJunkIcon}
        tooltip={$t`Move back to the Inbox, and train the junk filter`}
        disabled={!isJunk && $t`The selected messages are not junk`}
        onClick={() => MessageActions.junk(messages, false)} />
    </RibbonMenuButton>
  </RibbonGroup>
  <RibbonGroup label={$t`Respond`}>
    <RibbonButton label={$t`Reply`} icon={ReplyIcon}
      onClick={() => MessageActions.reply(single)}
      disabled={noSingle} shortCutInfo="Ctrl+R" />
    <RibbonButton label={$t`Reply All`} icon={ReplyAllIcon}
      onClick={() => MessageActions.replyAll(single)}
      disabled={noSingle || (!MessageActions.canReplyAll(single) && $t`There are no other recipients`)}
      shortCutInfo="Ctrl+Shift+R" />
    <RibbonButton label={$t`Forward`} icon={ForwardIcon}
      onClick={event => MessageActions.forward(single, event as MouseEvent)}
      disabled={noSingle} shortCutInfo="Ctrl+F" />
    <RibbonMenuButton label={$t`More`} icon={MoreRespondIcon} disabled={noSingle}>
      <MenuItem label={$t`Forward as Attachment`} icon={ForwardAttachmentIcon}
        shortCutInfo="Ctrl+Alt+F"
        onClick={() => MessageActions.forwardAsAttachment(single)} />
      <MenuItem label={$t`Redirect`} icon={RedirectIcon}
        tooltip={$t`Send this message to somebody else, who can reply to the original sender`}
        onClick={() => MessageActions.redirect(single)} />
      <MenuItem label={$t`Edit as New`} icon={EditAsNewIcon}
        tooltip={$t`Create a new message with the same content and recipients`}
        onClick={() => MessageActions.editAsNew(single)} />
      <MenuItem label={$t`New Topic to All`} icon={NewToAllIcon}
        tooltip={$t`Send a new, unrelated message to all recipients`}
        onClick={() => MessageActions.newToAll(single)} />
    </RibbonMenuButton>
  </RibbonGroup>
  <RibbonGroup label={$t`Move`}>
    <RibbonMenuButton label={$t`Move`} icon={MoveIcon} disabled={noSelection}>
      <MoveMenuItems {messages} />
    </RibbonMenuButton>
    <RibbonMenuButton label={$t`Rules`} icon={RulesIcon}>
      <RulesMenuItems message={single} account={realAccount} />
    </RibbonMenuButton>
  </RibbonGroup>
  <RibbonGroup label={$t`Tags`}>
    <RibbonButton label={$t`Unread/ Read`} icon={shouldMarkRead ? ReadIcon : UnreadIcon}
      tooltip={shouldMarkRead ? $t`Mark as Read` : $t`Mark as Unread`}
      onClick={() => MessageActions.toggleRead(messages)}
      disabled={noSelection} shortCutInfo={shouldMarkRead ? "Ctrl+Q" : "Ctrl+U"} />
    <RibbonMenuButton label={$t`Categorize`} icon={CategorizeIcon} disabled={noSelection}>
      <CategorizeMenuItems {messages} />
    </RibbonMenuButton>
    <RibbonToggleButton label={$t`Flag`} icon={FlagIcon}
      checked={isFlagged}
      tooltip={isFlagged ? $t`Clear Flag` : $t`Flag Message`}
      onChange={checked => MessageActions.flag(messages, checked)}
      disabled={noSelection} shortCutInfo="Insert" />
  </RibbonGroup>
  <RibbonGroup label={$t`Find`}>
    <RibbonButton label={$t`Address Book`} icon={AddressBookIcon}
      onClick={() => MessageActions.openAddressBook()} shortCutInfo="Ctrl+Shift+B" />
    <RibbonMenuButton label={$t`Filter Email`} icon={FilterIcon}>
      <FilterMenuItems />
    </RibbonMenuButton>
  </RibbonGroup>
  <RibbonGroup label={$t`Send/Receive`}>
    <RibbonButton label={$t`Send/Receive`} icon={SendReceiveIcon}
      tooltip={$t`Send/Receive All Folders`}
      onClick={() => MessageActions.sendReceiveAll()}
      disabled={!$accounts.hasItems && $t`Please set up a mail account first`}
      shortCutInfo="F9" />
  </RibbonGroup>
</RibbonTab>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import type { Folder } from "../../../logic/Mail/Folder";
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import { appGlobal } from "../../../logic/app";
  import { MessageActions } from "../MessageActions";
  import { SelectionState } from "../SelectionState";
  import RibbonTab from "../../Shared/Ribbon/RibbonTab.svelte";
  import RibbonGroup from "../../Shared/Ribbon/RibbonGroup.svelte";
  import RibbonButton from "../../Shared/Ribbon/RibbonButton.svelte";
  import RibbonToggleButton from "../../Shared/Ribbon/RibbonToggleButton.svelte";
  import RibbonMenuButton from "../../Shared/Ribbon/RibbonMenuButton.svelte";
  import MoveMenuItems from "../Menu/MoveMenuItems.svelte";
  import RulesMenuItems from "../Menu/RulesMenuItems.svelte";
  import CategorizeMenuItems from "../Menu/CategorizeMenuItems.svelte";
  import FilterMenuItems from "../Menu/FilterMenuItems.svelte";
  import MenuItem from "../../../frontend/Shared/Menu/MenuItem.svelte";
  import NewMailIcon from "lucide-svelte/icons/mail-plus";
  import NewItemsIcon from "lucide-svelte/icons/square-plus";
  import AppointmentIcon from "lucide-svelte/icons/calendar-plus";
  import MeetingIcon from "lucide-svelte/icons/users-round";
  import ContactIcon from "lucide-svelte/icons/user-round-plus";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import ArchiveIcon from "lucide-svelte/icons/archive";
  import JunkIcon from "lucide-svelte/icons/shield-x";
  import NotJunkIcon from "lucide-svelte/icons/shield-check";
  import ReplyIcon from "lucide-svelte/icons/reply";
  import ReplyAllIcon from "lucide-svelte/icons/reply-all";
  import ForwardIcon from "lucide-svelte/icons/forward";
  import MoreRespondIcon from "lucide-svelte/icons/message-square-more";
  import ForwardAttachmentIcon from "lucide-svelte/icons/paperclip";
  import RedirectIcon from "lucide-svelte/icons/move-right";
  import EditAsNewIcon from "lucide-svelte/icons/iteration-ccw";
  import NewToAllIcon from "lucide-svelte/icons/users-round";
  import MoveIcon from "lucide-svelte/icons/folder-input";
  import RulesIcon from "lucide-svelte/icons/list-filter";
  import ReadIcon from "lucide-svelte/icons/mail-open";
  import UnreadIcon from "lucide-svelte/icons/mail";
  import CategorizeIcon from "lucide-svelte/icons/tag";
  import FlagIcon from "lucide-svelte/icons/flag";
  import AddressBookIcon from "lucide-svelte/icons/book-user";
  import FilterIcon from "lucide-svelte/icons/funnel";
  import SendReceiveIcon from "lucide-svelte/icons/refresh-cw";
  import { t } from "../../../l10n/l10n";

  export let messages: EMail[] = [];
  export let folder: Folder | null = null;
  export let account: MailAccount | null = null;

  const accounts = appGlobal.emailAccounts;

  $: single = messages.length == 1 ? messages[0] : null;
  $: noSelection = !messages.length && $t`Select a message first`;
  $: noSingle = !single && (messages.length ? $t`Select only one message` : $t`Select a message first`);
  $: isJunk = MessageActions.isJunk(messages);
  $: isFlagged = SelectionState.allFlagged(messages);
  $: shouldMarkRead = !messages.length || SelectionState.shouldMarkRead(messages);
  $: realAccount = account && appGlobal.emailAccounts.contains(account) ? account : null;
</script>
