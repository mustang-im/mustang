<RibbonTab label={$t`Search`} isSelected>
  <RibbonGroup label={$t`Refine`}>
    <RibbonToggleButton label={$t`From`} icon={FromIcon}
      checked={isFrom}
      tooltip={isFrom ? $t`From: ${$searchOptions.person.name}` : $t`Only messages from a person`}
      onChange={checked => checked ? pickPerson($t`From`, person => setPerson(person, false)) : setPerson(null, false)} />
    <RibbonToggleButton label={$t`Has Attachments`} icon={AttachmentIcon}
      checked={$searchOptions.hasAttachment}
      onChange={checked => { $searchOptions = { ...$searchOptions, hasAttachment: checked }; }} />
    <RibbonMenuButton label={$t`Categorized`} icon={CategorizeIcon}
      disabled={!$tags.hasItems && $t`There are no categories yet`}>
      <CategoryMenuItems selected={$searchOptions.tags} onToggle={toggleTag} />
    </RibbonMenuButton>
    <RibbonMenuButton label={$searchOptions.received == ReceivedRange.Any || $searchOptions.received == ReceivedRange.Custom ? $t`This Week` : ReceivedRanges.label($searchOptions.received)}
      icon={ReceivedIcon}
      tooltip={$t`Received`}>
      <ReceivedMenuItems selected={$searchOptions.received}
        onSelect={received => $searchOptions = { ...$searchOptions, received, receivedStart: null, receivedEnd: null }} />
    </RibbonMenuButton>
    <RibbonMenuButton label={$t`Sent To`} icon={SentToIcon} size="small"
      tooltip={isSentTo ? $t`Sent To: ${$searchOptions.person.name}` : $t`Sent To`}>
      <MenuItem label={$t`Sent To Another Recipient…`} checkable checked={isSentTo}
        onClick={() => pickPerson($t`To`, person => setPerson(person, true))} />
      <MenuItem label={$t`Sent by Me`} checkable checked={isSentByMe}
        onClick={() => $searchOptions = { ...$searchOptions, person: null, isOutgoing: isSentByMe ? null : true }} />
    </RibbonMenuButton>
    <RibbonToggleButton label={$t`Unread`} icon={UnreadIcon} size="small"
      checked={$searchOptions.isRead === false}
      onChange={checked => { $searchOptions = { ...$searchOptions, isRead: checked ? false : null }; }} />
    <RibbonToggleButton label={$t`Flagged`} icon={FlagIcon} size="small"
      checked={$searchOptions.flagged}
      onChange={checked => { $searchOptions = { ...$searchOptions, flagged: checked }; }} />
    <RibbonMenuButton label={$t`More`} icon={MoreIcon} size="small"
      tooltip={$t`More refiners`}>
      <SubMenu label={$t`Received`}>
        <ReceivedMenuItems selected={$searchOptions.received}
          onSelect={received => $searchOptions = { ...$searchOptions, received, receivedStart: null, receivedEnd: null }} />
      </SubMenu>
      <SubMenu label={$t`Size`}>
        <SizeMenuItems selected={$searchOptions.size} onSelect={size => $searchOptions = { ...$searchOptions, size }} />
      </SubMenu>
      <SubMenu label={$t`Read`}>
        <MenuItem label={$t`Read`} checkable checked={$searchOptions.isRead === true}
          onClick={() => $searchOptions = { ...$searchOptions, isRead: $searchOptions.isRead === true ? null : true }} />
        <MenuItem label={$t`Unread`} checkable checked={$searchOptions.isRead === false}
          onClick={() => $searchOptions = { ...$searchOptions, isRead: $searchOptions.isRead === false ? null : false }} />
      </SubMenu>
      <MenuItem label={$t`Replied`} checkable checked={$searchOptions.replied}
        onClick={() => $searchOptions = { ...$searchOptions, replied: !$searchOptions.replied }} />
      <MenuDivider />
      <MenuItem label={$t`Advanced Search…`} icon={AdvancedIcon}
        onClick={() => $isAdvancedSearchOpen = true} />
    </RibbonMenuButton>
    {#if $searchOptions.threadID}
      <RibbonToggleButton label={$t`This Conversation`} icon={ConversationIcon} size="small"
        checked={true}
        tooltip={$t`Only messages of the conversation that you chose with Find Related`}
        onChange={checked => { if (!checked) { $searchOptions = { ...$searchOptions, threadID: null }; } }} />
    {/if}
  </RibbonGroup>
  <RibbonGroup label={$t`Scope`}>
    <RibbonToggleButton label={MailSearch.scopeLabel(SearchScope.AllAccounts)} shortLabel={MailSearch.scopeShortLabel(SearchScope.AllAccounts)} icon={AllAccountsIcon}
      checked={scope == SearchScope.AllAccounts} isRadio
      onChange={() => { $searchOptions = { ...$searchOptions, scope: SearchScope.AllAccounts }; }}
      shortCutInfo="Ctrl+Alt+A" />
    <RibbonToggleButton label={MailSearch.scopeLabel(SearchScope.CurrentAccount)} shortLabel={MailSearch.scopeShortLabel(SearchScope.CurrentAccount)} icon={AccountIcon}
      checked={scope == SearchScope.CurrentAccount} isRadio
      disabled={!MailSearch.isScopeAvailable(SearchScope.CurrentAccount, account, folder) && $t`Select a folder of an account first`}
      onChange={() => { $searchOptions = { ...$searchOptions, scope: SearchScope.CurrentAccount }; }} />
    <RibbonToggleButton label={MailSearch.scopeLabel(SearchScope.CurrentFolder)} shortLabel={MailSearch.scopeShortLabel(SearchScope.CurrentFolder)} icon={FolderIcon} size="small"
      checked={scope == SearchScope.CurrentFolder} isRadio
      disabled={!MailSearch.isScopeAvailable(SearchScope.CurrentFolder, account, folder) && $t`Select a folder of an account first`}
      onChange={() => { $searchOptions = { ...$searchOptions, scope: SearchScope.CurrentFolder }; }}
      shortCutInfo="Ctrl+Alt+K" />
  </RibbonGroup>
  <RibbonGroup label={$t`Options`}>
    <RibbonMenuButton label={$t`Search Tools`} shortLabel={$t`Tools *=> Search tools`} icon={SearchToolsIcon}>
      <MenuItem label={$t`Advanced Find…`} icon={AdvancedIcon} shortCutInfo="Ctrl+Shift+F"
        onClick={() => $isAdvancedSearchOpen = true} />
    </RibbonMenuButton>
    <RibbonButton label={$t`Save as Search Folder`} shortLabel={$t`Save Search`} icon={SaveSearchIcon} size="small"
      tooltip={$t`Save this search as a Search Folder`}
      onClick={onSaveSearch}
      disabled={saveDisabledReason} />
    <RibbonButton label={$t`Create Rule`} icon={CreateRuleIcon} size="small"
      tooltip={$t`Handle new messages that match this search automatically`}
      onClick={onCreateRule}
      disabled={(!search && $t`Type a search term first`) || (!ruleAccount && $t`Select a folder of an account first`)} />
  </RibbonGroup>
  <RibbonGroup label={$t`Close`}>
    <RibbonButton label={$t`Close Search`} icon={CloseIcon}
      onClick={onClose} shortCutInfo="Esc" />
  </RibbonGroup>
</RibbonTab>

<script lang="ts">
  import type { Folder } from "../../../logic/Mail/Folder";
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import type { Person } from "../../../logic/Abstract/Person";
  import type { SearchEMail } from "../../../logic/Mail/Store/SearchEMail";
  import { availableTags } from "../../../logic/Abstract/Tag";
  import type { Tag } from "../../../logic/Abstract/Tag";
  import { MailSearch, SearchScope } from "../Search/MailSearch";
  import { isAdvancedSearchOpen, searchOptions } from "../Selected";
  import { ReceivedRange, ReceivedRanges } from "../Search/SearchRanges";
  import { openSearchPerson } from "../Search/SearchPersonDialog.svelte";
  import { openSaveSearch } from "../Search/SavedSearchUI.svelte";
  import { openRulesFromSearch } from "../Search/RulesFromSearchUI.svelte";
  import RibbonTab from "../../Shared/Ribbon/RibbonTab.svelte";
  import RibbonGroup from "../../Shared/Ribbon/RibbonGroup.svelte";
  import RibbonButton from "../../Shared/Ribbon/RibbonButton.svelte";
  import RibbonToggleButton from "../../Shared/Ribbon/RibbonToggleButton.svelte";
  import RibbonMenuButton from "../../Shared/Ribbon/RibbonMenuButton.svelte";
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";
  import MenuDivider from "../../Shared/Menu/MenuDivider.svelte";
  import SubMenu from "../../Shared/Menu/SubMenu.svelte";
  import CategoryMenuItems from "../Search/CategoryMenuItems.svelte";
  import ReceivedMenuItems from "../Search/ReceivedMenuItems.svelte";
  import SizeMenuItems from "../Search/SizeMenuItems.svelte";
  import FromIcon from "lucide-svelte/icons/user-round";
  import AttachmentIcon from "lucide-svelte/icons/paperclip";
  import CategorizeIcon from "lucide-svelte/icons/tags";
  import ReceivedIcon from "lucide-svelte/icons/calendar-range";
  import SentToIcon from "lucide-svelte/icons/send";
  import UnreadIcon from "lucide-svelte/icons/mail";
  import FlagIcon from "lucide-svelte/icons/flag";
  import MoreIcon from "lucide-svelte/icons/plus";
  import AdvancedIcon from "lucide-svelte/icons/sliders-horizontal";
  import ConversationIcon from "lucide-svelte/icons/messages-square";
  import AllAccountsIcon from "lucide-svelte/icons/mails";
  import AccountIcon from "lucide-svelte/icons/inbox";
  import FolderIcon from "lucide-svelte/icons/folder";
  import SearchToolsIcon from "lucide-svelte/icons/wrench";
  import SaveSearchIcon from "lucide-svelte/icons/folder-search";
  import CreateRuleIcon from "lucide-svelte/icons/list-plus";
  import CloseIcon from "lucide-svelte/icons/x";
  import { t } from "../../../l10n/l10n";

  export let account: MailAccount | null = null;
  export let folder: Folder | null = null;
  export let search: SearchEMail | null = null;
  export let onClose: () => void;

  const tags = availableTags;
  $: scope = MailSearch.effectiveScope($searchOptions, account, folder);
  $: isFrom = !!$searchOptions.person && $searchOptions.isOutgoing !== true;
  // <copied to="../LeftPane/FilterMenuItems.svelte">
  $: isSentTo = !!$searchOptions.person && $searchOptions.isOutgoing === true;
  $: isSentByMe = !$searchOptions.person && $searchOptions.isOutgoing === true;
  // </copied>

  function pickPerson(fieldLabel: string, onPick: (person: Person) => void) {
    $openSearchPerson = { fieldLabel, person: $searchOptions.person, onPick };
    // The From toggle shows as pressed only once the person is picked
    $searchOptions = { ...$searchOptions };
  }

  function setPerson(person: Person | null, isOutgoing: boolean) {
    $searchOptions = person
      ? { ...$searchOptions, person, isOutgoing }
      : { ...$searchOptions, person: null, isOutgoing: null };
  }

  function toggleTag(tag: Tag) {
    $searchOptions = {
      ...$searchOptions,
      tags: $searchOptions.tags.includes(tag)
        ? $searchOptions.tags.filter(existing => existing != tag)
        : [...$searchOptions.tags, tag],
    };
  }

  $: saveDisabledReason = !search
    ? $t`Type a search term first`
    : MailSearch.hasDates(search)
      ? $t`Search Folders can't filter by the received date`
      : false;
  function onSaveSearch() {
    $openSaveSearch = search;
  }

  $: ruleAccount = search?.account ??
    (MailSearch.isRealFolder(folder) ? folder.account : MailSearch.isRealAccount(account) ? account : null);
  function onCreateRule() {
    $openRulesFromSearch = { search, account: ruleAccount };
  }
</script>
