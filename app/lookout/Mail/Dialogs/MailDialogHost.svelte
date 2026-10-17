{#if $dialog?.kind == "move-messages"}
  <MessageMovePopup messages={$dialog.messages} copy={$dialog.copy} on:close={onClose} />
{:else if $dialog?.kind == "new-folder"}
  <NewFolderDialog account={$dialog.account} parent={$dialog.parent} on:close={onClose} />
{:else if $dialog?.kind == "move-folder"}
  <MoveFolderDialog folder={$dialog.folder} on:close={onClose} />
{:else if $dialog?.kind == "go-to-folder"}
  <GoToFolderDialog on:close={onClose} />
{:else if $dialog?.kind == "folder-properties"}
  <FolderProperties folder={$dialog.folder} tab={$dialog.tab} on:close={onClose} />
{:else if $dialog?.kind == "reading-pane-options"}
  <ReadingPaneOptionsDialog on:close={onClose} />
{:else if $dialog?.kind == "message-properties"}
  <MessagePropertiesDialog message={$dialog.message} on:close={onClose} />
{:else if $dialog?.kind == "color-categories"}
  <ColorCategoriesDialog items={$dialog.messages} onClose={onClose} />
{:else if $dialog?.kind == "save-search"}
  <SavedSearchUI search={$dialog.search} on:close={onClose} />
{:else if $dialog?.kind == "rule-from-search"}
  <RulesFromSearchUI search={$dialog.search} account={$dialog.account} on:close={onClose} />
{:else if $dialog?.kind == "always-move-from"}
  <AlwaysMoveDialog message={$dialog.message} on:close={onClose} />
{:else if $dialog?.kind == "search-person"}
  <SearchPersonDialog fieldLabel={$dialog.fieldLabel} person={$dialog.person} onPick={$dialog.onPick} on:close={onClose} />
{:else if $dialog?.kind == "shared-folder"}
  <SharedFolderDialog account={$dialog.account} on:close={onClose} />
{:else if $dialog?.kind == "new-search-folder"}
  <NewSearchFolderDialog defaultAccount={$dialog.account} on:close={onClose} />
{:else if $dialog?.kind == "customize-search-folder"}
  <CustomizeSearchFolderDialog title={$t`Customize Search Folder`}
    name={$dialog.folder.name} search={$dialog.folder.search.clone()}
    onOK={(name, search) => SearchFolderCustomizing.save(customizedFolder, name, search)}
    onClose={onClose} />
{/if}

<script lang="ts">
  import { MailDialogs } from "./MailDialogs";
  import MessageMovePopup from "../Message/MessageMovePopup.svelte";
  import NewFolderDialog from "../LeftPane/NewFolderDialog.svelte";
  import MoveFolderDialog from "../LeftPane/MoveFolderDialog.svelte";
  import GoToFolderDialog from "../LeftPane/GoToFolderDialog.svelte";
  import FolderProperties from "../FolderProperties.svelte";
  import ReadingPaneOptionsDialog from "../Message/ReadingPaneOptionsDialog.svelte";
  import MessagePropertiesDialog from "../Message/MessagePropertiesDialog.svelte";
  import ColorCategoriesDialog from "../../Shared/Tag/ColorCategoriesDialog.svelte";
  import NewSearchFolderDialog from "../Search/NewSearchFolderDialog.svelte";
  import CustomizeSearchFolderDialog from "../Search/CustomizeSearchFolderDialog.svelte";
  import { SearchFolderCustomizing } from "../Search/SearchFolderCriteria";
  import SavedSearchUI from "../Search/SavedSearchUI.svelte";
  import SearchPersonDialog from "../Search/SearchPersonDialog.svelte";
  import RulesFromSearchUI from "../Search/RulesFromSearchUI.svelte";
  import AlwaysMoveDialog from "../Rules/AlwaysMoveDialog.svelte";
  import SharedFolderDialog from "../LeftPane/SharedFolderDialog.svelte";
  import { onDestroy } from "svelte";
  import { t } from "../../../l10n/l10n";

  const dialog = MailDialogs.current;
  $: customizedFolder = $dialog?.kind == "customize-search-folder" ? $dialog.folder : null;

  function onClose() {
    MailDialogs.close();
  }

  onDestroy(onClose);
</script>
