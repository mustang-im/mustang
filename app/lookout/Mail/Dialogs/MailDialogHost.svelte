{#if $dialog?.kind == "move-messages"}
  <MoveItemsDialog messages={$dialog.messages} copy={$dialog.copy} on:close={onClose} />
{:else if $dialog?.kind == "new-folder"}
  <NewFolderDialog account={$dialog.account} parent={$dialog.parent} on:close={onClose} />
{:else if $dialog?.kind == "go-to-folder"}
  <GoToFolderDialog on:close={onClose} />
{:else if $dialog?.kind == "folder-properties"}
  <FolderPropertiesDialog folder={$dialog.folder} tab={$dialog.tab} on:close={onClose} />
{:else if $dialog?.kind == "reading-pane-options"}
  <ReadingPaneOptionsDialog on:close={onClose} />
{:else if $dialog?.kind == "color-categories"}
  <ColorCategoriesDialog items={$dialog.messages} onClose={onClose} />
{:else if $dialog?.kind == "save-search"}
  <SaveSearchDialog search={$dialog.search} on:close={onClose} />
{:else if $dialog?.kind == "rule-from-search"}
  <RuleFromSearchDialog search={$dialog.search} account={$dialog.account} on:close={onClose} />
{:else if $dialog?.kind == "always-move-from"}
  <AlwaysMoveDialog message={$dialog.message} on:close={onClose} />
{:else if $dialog?.kind == "search-person"}
  <SearchPersonDialog fieldLabel={$dialog.fieldLabel} person={$dialog.person} onPick={$dialog.onPick} on:close={onClose} />
{:else if $dialog?.kind == "shared-folder"}
  <SharedFolderDialog account={$dialog.account} on:close={onClose} />
{:else if $dialog?.kind == "new-search-folder"}
  <NewSearchFolderDialog defaultAccount={$dialog.account} on:close={onClose} />
{/if}

<script lang="ts">
  import { MailDialogs } from "./MailDialogs";
  import MoveItemsDialog from "./MoveItemsDialog.svelte";
  import NewFolderDialog from "./NewFolderDialog.svelte";
  import GoToFolderDialog from "./GoToFolderDialog.svelte";
  import FolderPropertiesDialog from "./FolderPropertiesDialog.svelte";
  import ReadingPaneOptionsDialog from "./ReadingPaneOptionsDialog.svelte";
  import ColorCategoriesDialog from "../Categories/ColorCategoriesDialog.svelte";
  import NewSearchFolderDialog from "./NewSearchFolderDialog.svelte";
  import SaveSearchDialog from "./SaveSearchDialog.svelte";
  import SearchPersonDialog from "./SearchPersonDialog.svelte";
  import RuleFromSearchDialog from "./RuleFromSearchDialog.svelte";
  import AlwaysMoveDialog from "../Rules/AlwaysMoveDialog.svelte";
  import SharedFolderDialog from "./SharedFolderDialog.svelte";
  import { onDestroy } from "svelte";

  const dialog = MailDialogs.current;

  function onClose() {
    MailDialogs.close();
  }

  onDestroy(onClose);
</script>
