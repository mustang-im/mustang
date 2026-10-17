<RibbonTab label={$t`Home`}>
  <RibbonGroup label={$t`New`}>
    <RibbonButton label={$t`New Email`} icon={NewMailIcon}
      onClick={() => MessageActions.newMail(folder)}
      disabled={!$accounts.hasItems && $t`Please set up a mail account first`}
      shortCutInfo="Ctrl+N" />
    <RibbonMenuButton label={$t`New Items`} icon={NewItemsIcon}>
      <MenuItem label={$t`Email Message`} icon={NewMailIcon} shortCutInfo="Ctrl+Shift+M"
        onClick={() => MessageActions.newMail(folder)} />
      <MenuItem label={$t`Appointment`} icon={AppointmentIcon} shortCutInfo="Ctrl+Shift+A"
        onClick={() => MessageActions.newAppointment()} />
      <MenuItem label={$t`Meeting`} icon={MeetingIcon} shortCutInfo="Ctrl+Shift+Q"
        onClick={() => MessageActions.newMeeting()} />
      <MenuItem label={$t`Contact`} icon={ContactIcon} shortCutInfo="Ctrl+Shift+C"
        onClick={() => MessageActions.newContact()} />
      <MenuItem label={$t`Contact Group`} icon={ContactGroupIcon} shortCutInfo="Ctrl+Shift+L"
        onClick={() => ContactActions.newGroup(null)} />
    </RibbonMenuButton>
  </RibbonGroup>
  <RibbonGroup label={$t`Delete`}>
    <RibbonMenuButton label={$t`Junk`} icon={JunkIcon} size="small" disabled={noSelection}>
      <JunkMenuItems {messages} />
    </RibbonMenuButton>
    <RibbonButton label={$t`Delete`} icon={DeleteIcon}
      onClick={() => MessageActions.delete(messages)}
      disabled={noSelection} shortCutInfo="Del" />
    <RibbonButton label={$t`Archive`} icon={ArchiveIcon}
      onClick={() => MessageActions.archive(messages)}
      disabled={noSelection} shortCutInfo="Backspace" />
  </RibbonGroup>
  <RibbonGroup label={$t`Respond`}>
    <RibbonButton label={$t`Reply`} icon={ReplyIcon} size="small"
      onClick={() => MessageActions.reply(single)}
      disabled={noSingle} shortCutInfo="Ctrl+R" />
    <RibbonButton label={$t`Reply All`} icon={ReplyAllIcon} size="small"
      onClick={() => MessageActions.replyAll(single)}
      disabled={noSingle || (!MessageActions.canReplyAll(single) && $t`There are no other recipients`)}
      shortCutInfo="Ctrl+Shift+R" />
    <RibbonButton label={$t`Forward`} icon={ForwardIcon} size="small"
      onClick={event => MessageActions.forward(single, event as MouseEvent)}
      disabled={noSingle} shortCutInfo="Ctrl+F" />
    <RibbonMenuButton label={$t`More`} icon={MoreRespondIcon} size="small" disabled={noSingle}>
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
    <RibbonButton label={$t`Move`} icon={MoveIcon} disabled={noSelection}
      tooltip={$t`Move the selected messages to another folder`} shortCutInfo="Ctrl+Shift+V"
      onClick={() => MailDialogs.open({ kind: "move-messages", messages, copy: false })} />
    <RibbonButton label={$t`Copy`} icon={CopyIcon} size="small" disabled={noSelection}
      tooltip={$t`Copy the selected messages to another folder`} shortCutInfo="Ctrl+Shift+Y"
      onClick={() => MailDialogs.open({ kind: "move-messages", messages, copy: true })} />
    <RibbonMenuButton label={$t`Rules`} icon={RulesIcon} size="small">
      <RulesMenuItems message={single} account={realAccount} />
    </RibbonMenuButton>
  </RibbonGroup>
  <RibbonGroup label={$t`Tags`}>
    <RibbonButton label={$t`Unread/ Read`} icon={shouldMarkRead ? ReadIcon : UnreadIcon} size="small"
      tooltip={shouldMarkRead ? $t`Mark as Read` : $t`Mark as Unread`}
      onClick={() => MessageActions.toggleRead(messages)}
      disabled={noSelection} shortCutInfo={shouldMarkRead ? "Ctrl+Alt+U" : "Ctrl+U"} />
    <RibbonMenuButton label={$t`Categorize`} icon={CategorizeIcon} size="small" disabled={noSelection}>
      <CategorizeMenuItems {messages} />
    </RibbonMenuButton>
    <RibbonMenuButton label={$t`Follow Up`} icon={FlagIcon} size="small" disabled={noSelection}>
      <FollowUpMenuItems {messages} />
    </RibbonMenuButton>
  </RibbonGroup>
  <RibbonGroup label={$t`Find`}>
    {#if !isSimplified}
      <RibbonTextBox label={$t`Search People`} placeholder={$t`Search People`} icon={SearchPeopleIcon}
        width="150px"
        bind:value={peopleSearch}
        bind:isListOpen={isPeopleListOpen}
        onInput={() => { isPeopleListOpen = !!peopleMatches.length; }}
        onEnter={openFirstPerson}>
        <svelte:fragment slot="list">
          {#each peopleMatches as person (person)}
            <MenuItem label={person.name || person.emailAddresses.first?.value} icon={ContactIcon}
              tooltip={person.emailAddresses.first?.value}
              onClick={() => openPerson(person)} />
          {:else}
            <MenuItem label={$t`No matches`} disabled />
          {/each}
        </svelte:fragment>
      </RibbonTextBox>
    {/if}
    <RibbonButton label={$t`Address Book`} icon={AddressBookIcon} size="small"
      onClick={() => MessageActions.openAddressBook()} shortCutInfo="Ctrl+Shift+B" />
    <RibbonMenuButton label={$t`Filter Email`} icon={FilterIcon} size="small">
      <FilterMenuItems />
    </RibbonMenuButton>
  </RibbonGroup>
  <RibbonGroup label={$t`Send/Receive`}>
    <RibbonButton label={$t`Send/Receive All Folders`} shortLabel={$t`Send/Receive`} icon={SendReceiveIcon}
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
  import { MailDialogs } from "../Dialogs/MailDialogs";
  import { SelectionState } from "../SelectionState";
  import RibbonTab from "../../Shared/Ribbon/RibbonTab.svelte";
  import RibbonGroup from "../../Shared/Ribbon/RibbonGroup.svelte";
  import RibbonButton from "../../Shared/Ribbon/RibbonButton.svelte";
  import RibbonMenuButton from "../../Shared/Ribbon/RibbonMenuButton.svelte";
  import RibbonTextBox from "../../Shared/Ribbon/RibbonTextBox.svelte";
  import type { RibbonLayout } from "../../Shared/Ribbon/RibbonGroup";
  import { ContactActions } from "../../Contacts/ContactActions";
  import { SelectNames } from "../Composer/SelectNames";
  import type { Person } from "../../../logic/Abstract/Person";
  import { getLocalStorage } from "../../../frontend/Util/LocalStorage";
  import JunkMenuItems from "../Message/JunkMenuItems.svelte";
  import FollowUpMenuItems from "../Message/FollowUpMenuItems.svelte";
  import RulesMenuItems from "../Rules/RulesMenuItems.svelte";
  import CategorizeMenuItems from "../Message/CategorizeMenuItems.svelte";
  import FilterMenuItems from "../LeftPane/FilterMenuItems.svelte";
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";
  import NewMailIcon from "lucide-svelte/icons/mail-plus";
  import NewItemsIcon from "lucide-svelte/icons/square-plus";
  import AppointmentIcon from "lucide-svelte/icons/calendar-plus";
  import MeetingIcon from "lucide-svelte/icons/users-round";
  import ContactIcon from "lucide-svelte/icons/user-round-plus";
  import ContactGroupIcon from "lucide-svelte/icons/users";
  import SearchPeopleIcon from "lucide-svelte/icons/user-search";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import ArchiveIcon from "lucide-svelte/icons/archive";
  import JunkIcon from "lucide-svelte/icons/shield-x";
  import ReplyIcon from "lucide-svelte/icons/reply";
  import ReplyAllIcon from "lucide-svelte/icons/reply-all";
  import ForwardIcon from "lucide-svelte/icons/forward";
  import MoreRespondIcon from "lucide-svelte/icons/message-square-more";
  import ForwardAttachmentIcon from "lucide-svelte/icons/paperclip";
  import RedirectIcon from "lucide-svelte/icons/move-right";
  import EditAsNewIcon from "lucide-svelte/icons/iteration-ccw";
  import NewToAllIcon from "lucide-svelte/icons/users-round";
  import MoveIcon from "lucide-svelte/icons/folder-input";
  import CopyIcon from "lucide-svelte/icons/copy";
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
  const ribbonLayout = getLocalStorage<RibbonLayout>("lookout.ribbon.layout", "classic");
  $: isSimplified = $ribbonLayout.value == "simplified";

  let peopleSearch = "";
  let isPeopleListOpen = false;
  $: peopleMatches = peopleSearch.trim().length >= 2
    ? SelectNames.persons(appGlobal.addressbooks, peopleSearch.trim()).contents.slice(0, 8)
    : [];

  function openPerson(person: Person) {
    isPeopleListOpen = false;
    peopleSearch = "";
    ContactActions.edit(person);
  }

  function openFirstPerson() {
    if (peopleMatches.length) {
      openPerson(peopleMatches[0]);
    }
  }
  $: shouldMarkRead = !messages.length || SelectionState.shouldMarkRead(messages);
  $: realAccount = account && appGlobal.emailAccounts.contains(account) ? account : null;
</script>
