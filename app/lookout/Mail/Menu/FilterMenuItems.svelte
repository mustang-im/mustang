<MenuItem label={$t`Unread`} icon={$quickSearch && MailFilters.isActive(QuickFilter.Unread) ? CheckIcon : UnreadIcon}
  onClick={() => MailFilters.toggle(QuickFilter.Unread)} />
<MenuItem label={$t`Has Attachments`} icon={$quickSearch && MailFilters.isActive(QuickFilter.Attachments) ? CheckIcon : AttachmentIcon}
  onClick={() => MailFilters.toggle(QuickFilter.Attachments)} />
<MenuItem label={$t`Flagged`} icon={$quickSearch && MailFilters.isActive(QuickFilter.Flagged) ? CheckIcon : FlagIcon}
  onClick={() => MailFilters.toggle(QuickFilter.Flagged)} />
<MenuDivider />
<MenuItem label={$t`Clear Filter`} icon={ClearIcon}
  disabled={!($quickSearch && quickSearch.hasSearch()) && $t`No filter is applied`}
  onClick={() => MailFilters.clear()} />

<script lang="ts">
  import { quickSearch } from "../../../frontend/Mail/Selected";
  import { MailFilters, QuickFilter } from "../MailFilters";
  import MenuItem from "../../../frontend/Shared/Menu/MenuItem.svelte";
  import MenuDivider from "../../../frontend/Shared/Menu/MenuDivider.svelte";
  import CheckIcon from "lucide-svelte/icons/check";
  import UnreadIcon from "lucide-svelte/icons/mail";
  import AttachmentIcon from "lucide-svelte/icons/paperclip";
  import FlagIcon from "lucide-svelte/icons/flag";
  import ClearIcon from "lucide-svelte/icons/funnel-x";
  import { t } from "../../../l10n/l10n";
</script>
