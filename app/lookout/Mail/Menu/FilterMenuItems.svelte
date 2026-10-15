<MenuItem label={$t`Unread`} icon={isUnread ? CheckIcon : UnreadIcon}
  onClick={() => MailFilters.toggle(QuickFilter.Unread)} />
<MenuItem label={$t`Has Attachments`} icon={hasAttachments ? CheckIcon : AttachmentIcon}
  onClick={() => MailFilters.toggle(QuickFilter.Attachments)} />
<SubMenuItem label={$t`This Week`}
  icon={$options.received != ReceivedRange.Any ? CheckIcon : ReceivedIcon}>
  <ReceivedMenuItems selected={$options.received}
    onSelect={received => MailFilters.searchInFolder({ received, receivedStart: null, receivedEnd: null })} />
</SubMenuItem>
<SubMenuItem label={$t`Categorized`} icon={$options.tags.length ? CheckIcon : CategorizeIcon}
  disabled={!$tags.hasItems && $t`There are no categories yet`}>
  <CategoryMenuItems selected={$options.tags}
    onToggle={tag => MailFilters.searchInFolder({ tags: $options.tags.includes(tag) ? $options.tags.filter(existing => existing != tag) : [...$options.tags, tag] })} />
</SubMenuItem>
<MenuItem label={$t`Flagged`} icon={isFlagged ? CheckIcon : FlagIcon}
  onClick={() => MailFilters.toggle(QuickFilter.Flagged)} />
<SubMenuItem label={$t`Sent To`} icon={$options.isOutgoing === true ? CheckIcon : SentToIcon}>
  <MenuItem label={$t`Sent To Another Recipient…`} icon={MailSearch.isSentTo($options) ? CheckIcon : BlankIcon}
    onClick={onSentTo} />
  <MenuItem label={$t`Sent by Me`} icon={MailSearch.isSentByMe($options) ? CheckIcon : BlankIcon}
    onClick={() => MailFilters.searchInFolder({ person: null, isOutgoing: MailSearch.isSentByMe($options) ? null : true })} />
</SubMenuItem>
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
  import { ReceivedRange } from "../Search/SearchRanges";
  import { MailDialogs } from "../Dialogs/MailDialogs";
  import MenuItem from "../../../frontend/Shared/Menu/MenuItem.svelte";
  import MenuDivider from "../../../frontend/Shared/Menu/MenuDivider.svelte";
  import BlankIcon from "../../Shared/Menu/BlankIcon.svelte";
  import SubMenuItem from "./SubMenuItem.svelte";
  import ReceivedMenuItems from "../Search/ReceivedMenuItems.svelte";
  import CategoryMenuItems from "../Search/CategoryMenuItems.svelte";
  import CheckIcon from "lucide-svelte/icons/check";
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
