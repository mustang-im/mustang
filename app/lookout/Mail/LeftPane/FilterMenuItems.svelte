<MenuItem label={$t`Unread`} icon={UnreadIcon} checkable checked={isUnread}
  onClick={() => MailFilters.toggle(QuickFilter.Unread)} />
<MenuItem label={$t`Has Attachments`} icon={AttachmentIcon} checkable checked={hasAttachments}
  onClick={() => MailFilters.toggle(QuickFilter.Attachments)} />
<SubMenu label={$t`This Week`} icon={ReceivedIcon}>
  <ReceivedMenuItems selected={$options.received}
    onSelect={received => MailFilters.searchInFolder({ received, receivedStart: null, receivedEnd: null })} />
</SubMenu>
<SubMenu label={$t`Categorized`} icon={CategorizeIcon}
  disabled={!$tags.hasItems && $t`There are no categories yet`}>
  <CategoryMenuItems selected={$options.tags}
    onToggle={tag => MailFilters.searchInFolder({ tags: $options.tags.includes(tag) ? $options.tags.filter(existing => existing != tag) : [...$options.tags, tag] })} />
</SubMenu>
<MenuItem label={$t`Flagged`} icon={FlagIcon} checkable checked={isFlagged}
  onClick={() => MailFilters.toggle(QuickFilter.Flagged)} />
<SubMenu label={$t`Sent To`} icon={SentToIcon}>
  <MenuItem label={$t`Sent To Another Recipient…`} checkable checked={MailSearch.isSentTo($options)}
    onClick={onSentTo} />
  <MenuItem label={$t`Sent by Me`} checkable checked={MailSearch.isSentByMe($options)}
    onClick={() => MailFilters.searchInFolder({ person: null, isOutgoing: MailSearch.isSentByMe($options) ? null : true })} />
</SubMenu>
<MenuItem label={$t`More Filters…`} icon={MoreFiltersIcon}
  onClick={() => MailFilters.moreFilters()} />
{#if hasFilter}
  <MenuDivider />
  <MenuItem label={$t`Clear Filter`} icon={ClearIcon}
    onClick={() => MailFilters.clear()} />
{/if}

<script lang="ts">
  import { availableTags } from "../../../logic/Abstract/Tag";
  import { quickSearch } from "../../../frontend/Mail/Selected";
  import { globalSearchTerm } from "../../../frontend/AppsBar/selectedApp";
  import { MailFilters, QuickFilter } from "../MailFilters";
  import { MailSearch } from "../Search/MailSearch";
  import { MailDialogs } from "../Dialogs/MailDialogs";
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";
  import MenuDivider from "../../Shared/Menu/MenuDivider.svelte";
  import SubMenu from "../../Shared/Menu/SubMenu.svelte";
  import ReceivedMenuItems from "../Search/ReceivedMenuItems.svelte";
  import CategoryMenuItems from "../Search/CategoryMenuItems.svelte";
  import UnreadIcon from "lucide-svelte/icons/mail";
  import AttachmentIcon from "lucide-svelte/icons/paperclip";
  import ReceivedIcon from "lucide-svelte/icons/calendar-range";
  import CategorizeIcon from "lucide-svelte/icons/tags";
  import FlagIcon from "lucide-svelte/icons/flag";
  import SentToIcon from "lucide-svelte/icons/send";
  import MoreFiltersIcon from "lucide-svelte/icons/sliders-horizontal";
  import ClearIcon from "lucide-svelte/icons/funnel-x";
  import { t } from "../../../l10n/l10n";

  const options = MailSearch.options;
  const searchTerm = globalSearchTerm;
  const tags = availableTags;
  $: $quickSearch, $options, $searchTerm, updateStates();
  let isUnread = false;
  let hasAttachments = false;
  let isFlagged = false;
  let hasFilter = false;
  function updateStates() {
    isUnread = MailFilters.isActive(QuickFilter.Unread);
    hasAttachments = MailFilters.isActive(QuickFilter.Attachments);
    isFlagged = MailFilters.isActive(QuickFilter.Flagged);
    hasFilter = MailFilters.hasFilter();
  }

  function onSentTo() {
    MailDialogs.open({
      kind: "search-person",
      fieldLabel: $t`To`,
      person: MailSearch.isSentTo($options) ? $options.person : null,
      onPick: person => person && MailFilters.searchInFolder({ person, isOutgoing: true }),
    });
  }
</script>
