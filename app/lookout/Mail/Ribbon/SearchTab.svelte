<RibbonTab label={$t`Search`}>
  <RibbonGroup label={$t`Scope`}>
    <RibbonToggleButton label={$t`All Accounts`} icon={AllAccountsIcon}
      checked={scope == SearchScope.AllAccounts}
      onChange={() => MailSearch.update({ scope: SearchScope.AllAccounts })}
      shortCutInfo="Ctrl+Alt+A" />
    <RibbonToggleButton label={$t`Current Account`} icon={AccountIcon}
      checked={scope == SearchScope.CurrentAccount}
      disabled={!MailSearch.isScopeAvailable(SearchScope.CurrentAccount, account, folder) && $t`Select a folder of an account first`}
      onChange={() => MailSearch.update({ scope: SearchScope.CurrentAccount })} />
    <RibbonToggleButton label={$t`Current Folder`} icon={FolderIcon}
      checked={scope == SearchScope.CurrentFolder}
      disabled={!MailSearch.isScopeAvailable(SearchScope.CurrentFolder, account, folder) && $t`Select a folder of an account first`}
      onChange={() => MailSearch.update({ scope: SearchScope.CurrentFolder })}
      shortCutInfo="Ctrl+Alt+K" />
  </RibbonGroup>
  <RibbonGroup label={$t`Refine`}>
    <RibbonToggleButton label={$t`Has Attachments`} icon={AttachmentIcon}
      checked={$options.hasAttachment}
      onChange={checked => MailSearch.update({ hasAttachment: checked })} />
    <RibbonToggleButton label={$t`Unread`} icon={UnreadIcon}
      checked={$options.unread}
      onChange={checked => MailSearch.update({ unread: checked })} />
    <RibbonToggleButton label={$t`Flagged`} icon={FlagIcon}
      checked={$options.flagged}
      onChange={checked => MailSearch.update({ flagged: checked })} />
    <RibbonToggleButton label={$t`Sent by Me`} icon={SentIcon}
      checked={$options.sentByMe}
      onChange={checked => MailSearch.update({ sentByMe: checked })} />
    <RibbonMenuButton label={$options.person ? $options.person.name : $t`Person`} icon={PersonIcon}
      tooltip={$t`Only messages from or to a person in your address books`}>
      <MenuItem label={$t`Choose Person…`} icon={PersonIcon}
        onClick={() => MailDialogs.open({ kind: "search-person" })} />
      {#if $options.person}
        <MenuItem label={$t`Any Person`} icon={RemoveIcon}
          onClick={() => MailSearch.update({ person: null })} />
      {/if}
    </RibbonMenuButton>
    <RibbonMenuButton label={$t`Categorized`} icon={CategorizeIcon}
      disabled={!$tags.hasItems && $t`There are no categories yet`}>
      {#each $tags.each as tag (tag)}
        <MenuItem label={tag.name} selected={$options.tags.includes(tag)}
          onClick={() => MailSearch.toggleTag($options, tag)}>
          <CategorySquare slot="icon" color={tag.color} state={$options.tags.includes(tag) ? TagState.All : TagState.None} />
        </MenuItem>
      {/each}
    </RibbonMenuButton>
  </RibbonGroup>
  <RibbonGroup label={$t`Options`}>
    <RibbonButton label={$t`Save Search`} icon={SaveSearchIcon}
      tooltip={$t`Save this search as a Search Folder`}
      onClick={onSaveSearch}
      disabled={!search && $t`Type a search term first`} />
  </RibbonGroup>
  <RibbonGroup label={$t`Close`}>
    <RibbonButton label={$t`Close Search`} icon={CloseIcon}
      onClick={onClose} shortCutInfo="Esc" />
  </RibbonGroup>
</RibbonTab>

<script lang="ts">
  import type { Folder } from "../../../logic/Mail/Folder";
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import type { SearchEMail } from "../../../logic/Mail/Store/SearchEMail";
  import { availableTags } from "../../../logic/Abstract/Tag";
  import { MailSearch, SearchScope } from "../Search/MailSearch";
  import { MailDialogs } from "../Dialogs/MailDialogs";
  import RibbonTab from "../../Shared/Ribbon/RibbonTab.svelte";
  import RibbonGroup from "../../Shared/Ribbon/RibbonGroup.svelte";
  import RibbonButton from "../../Shared/Ribbon/RibbonButton.svelte";
  import RibbonToggleButton from "../../Shared/Ribbon/RibbonToggleButton.svelte";
  import RibbonMenuButton from "../../Shared/Ribbon/RibbonMenuButton.svelte";
  import MenuItem from "../../../frontend/Shared/Menu/MenuItem.svelte";
  import CategorySquare from "../Menu/CategorySquare.svelte";
  import { TagState } from "../SelectionState";
  import AllAccountsIcon from "lucide-svelte/icons/inbox";
  import AccountIcon from "lucide-svelte/icons/at-sign";
  import FolderIcon from "lucide-svelte/icons/folder";
  import AttachmentIcon from "lucide-svelte/icons/paperclip";
  import UnreadIcon from "lucide-svelte/icons/mail";
  import FlagIcon from "lucide-svelte/icons/flag";
  import SentIcon from "lucide-svelte/icons/send";
  import CategorizeIcon from "lucide-svelte/icons/tag";
  import PersonIcon from "lucide-svelte/icons/user-search";
  import RemoveIcon from "lucide-svelte/icons/user-x";
  import SaveSearchIcon from "lucide-svelte/icons/folder-search";
  import CloseIcon from "lucide-svelte/icons/x";
  import { t } from "../../../l10n/l10n";

  export let account: MailAccount | null = null;
  export let folder: Folder | null = null;
  export let search: SearchEMail | null = null;
  export let onClose: () => void;

  const options = MailSearch.options;
  const tags = availableTags;
  $: scope = MailSearch.effectiveScope($options, account, folder);

  function onSaveSearch() {
    MailDialogs.open({ kind: "save-search", search });
  }
</script>
