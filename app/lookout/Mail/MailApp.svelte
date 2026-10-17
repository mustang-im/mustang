<vbox flex class="mail-page" bind:this={pageEl}>
  <Ribbon>
    <HomeTab messages={$selectedArray} folder={$selectedFolder} account={$selectedAccount} />
    <SendReceiveTab folder={$selectedFolder} />
    <FolderTab folder={$selectedFolder} account={$selectedAccount} />
    <ViewTab folder={$selectedFolder}
      onCollapseGroup={collapsed => listPane?.setGroupOfSelectionCollapsed(collapsed)}
      onCollapseAll={collapsed => listPane?.setAllGroupsCollapsed(collapsed)} />
    {#if isSearchActive}
      <SearchTab account={$selectedAccount} folder={$selectedFolder} search={currentSearch} onClose={closeSearch} />
    {/if}
    {#if $inlineRibbon}
      <ComposerMessageTab commands={$inlineRibbon.commands} isInline />
    {/if}
  </Ribbon>
  <ThreePane bind:listPane
    messages={listMessages}
    selectedFolder={$selectedFolder}
    bind:selectedMessage={$selectedMessage}
    selectedMessages={$selectedMessages}
    isSearchResult={!!searchResults}
    onMoreResults={!isSearching && MailSearch.isLimitReached(searchResults) && !isShowingAllResults ? showAllResults : null}
    showFolder={!!searchResults || $selectedFolder instanceof SavedSearchFolder}
    highlight={searchResults ? searchTerm : null}
    isLoading={isLoading || isSearching} />
</vbox>
{#if $openMoveMessages}
  <MessageMovePopup messages={$openMoveMessages.messages} copy={$openMoveMessages.copy} on:close={() => $openMoveMessages = null} />
{/if}
{#if $openNewFolder}
  <NewFolderDialog account={$openNewFolder.account} parent={$openNewFolder.parent} on:close={() => $openNewFolder = null} />
{/if}
{#if $openMoveFolder}
  <MoveFolderDialog folder={$openMoveFolder} on:close={() => $openMoveFolder = null} />
{/if}
{#if isGoToFolderOpen}
  <GoToFolderDialog on:close={() => isGoToFolderOpen = false} />
{/if}
{#if $openFolderProperties}
  <FolderProperties folder={$openFolderProperties.folder} tab={$openFolderProperties.tab} on:close={() => $openFolderProperties = null} />
{/if}
{#if $openReadingPaneOptions}
  <ReadingPaneOptionsDialog on:close={() => $openReadingPaneOptions = false} />
{/if}
{#if $openColorCategories}
  <ColorCategoriesDialog items={$openColorCategories} onClose={() => $openColorCategories = null} />
{/if}
{#if $openSaveSearch}
  <SavedSearchUI search={$openSaveSearch} on:close={() => $openSaveSearch = null} />
{/if}
{#if $openRulesFromSearch}
  <RulesFromSearchUI search={$openRulesFromSearch.search} account={$openRulesFromSearch.account} on:close={() => $openRulesFromSearch = null} />
{/if}
{#if $openAlwaysMove}
  <AlwaysMoveDialog message={$openAlwaysMove} on:close={() => $openAlwaysMove = null} />
{/if}
{#if $openSearchPerson}
  <SearchPersonDialog fieldLabel={$openSearchPerson.fieldLabel} person={$openSearchPerson.person} onPick={$openSearchPerson.onPick}
    on:close={() => $openSearchPerson = null} />
{/if}
{#if $openSharedFolder}
  <SharedFolderDialog account={$openSharedFolder} on:close={() => $openSharedFolder = null} />
{/if}
{#if $openNewSearchFolder}
  <NewSearchFolderDialog defaultAccount={$openNewSearchFolder.account} on:close={() => $openNewSearchFolder = null} />
{/if}
{#if $openCustomizeSearchFolder}
  <CustomizeSearchFolderDialog title={$t`Customize Search Folder`}
    name={$openCustomizeSearchFolder.name} search={$openCustomizeSearchFolder.search.clone()}
    onOK={(name, search) => SearchFolderCustomizing.save($openCustomizeSearchFolder, name, search)}
    onClose={() => $openCustomizeSearchFolder = null} />
{/if}
{#if $openViewSettings}
  <ViewSettingsDialog folder={$openViewSettings.folder} on:close={() => $openViewSettings = null} />
{/if}
{#if $openShowColumns}
  <ShowColumnsDialog columns={MailViewSettings.of($openShowColumns.folder).columns}
    onOK={columns => MailViewSettings.change($openShowColumns.folder, { columns })}
    on:close={() => $openShowColumns = null} />
{/if}
{#if $openApplyView}
  <ApplyViewDialog folder={$openApplyView.folder} on:close={() => $openApplyView = null} />
{/if}
{#if $askedScope}
  <ApplyScopeDialog question={$askedScope.question} onChoice={$askedScope.onChoice} on:close={onScopeClosed} />
{/if}
<MessagePrint />
<svelte:window on:keydown={onKeyDown} on:focusin={onFocusChange} on:focusout={onFocusChange} />

<script lang="ts">
  import type { EMail } from "../../logic/Mail/EMail";
  import type { Folder } from "../../logic/Mail/Folder";
  import type { SearchEMail } from "../../logic/Mail/Store/SearchEMail";
  import { appGlobal } from "../../logic/app";
  import { SavedSearchFolder } from "../../logic/Mail/Virtual/SavedSearchFolder";
  import { selectedAccount, selectedFolder, selectedMessage, selectedMessages, quickSearch } from "../../frontend/Mail/Selected";
  import { getParams, globalSearchTerm } from "../../frontend/AppsBar/selectedApp";
  import { catchErrors, showError } from "../../frontend/Util/error";
  import { statusBarContent, type StatusBarContent, type StatusBarView } from "../MainWindow/StatusBar.svelte";
  import { FolderPaneMode } from "./LeftPane/LeftPane.svelte";
  import { getLocalStorage } from "../../frontend/Util/LocalStorage";
  import NormalViewIcon from "lucide-svelte/icons/layout-panel-left";
  import ReadingViewIcon from "lucide-svelte/icons/book-open";
  import { MailKeyAction, MailKeys } from "./MailKeys";
  import { TitleBarSearch } from "../MainWindow/TitleBarSearch";
  import { Keyboard } from "../Util/keyboard";
  import { MessageActions } from "./MessageActions";
  import { MailSearch, SearchScope } from "./Search/MailSearch";
  import { QuickFilterList } from "./QuickFilterList";
  import { FolderTreeActions } from "./FolderPane/FolderTreeActions";
  import Ribbon from "../Shared/Ribbon/Ribbon.svelte";
  import HomeTab from "./Ribbon/HomeTab.svelte";
  import SendReceiveTab from "./Ribbon/SendReceiveTab.svelte";
  import FolderTab from "./Ribbon/FolderTab.svelte";
  import ViewTab from "./Ribbon/ViewTab.svelte";
  import SearchTab from "./Ribbon/SearchTab.svelte";
  import ComposerMessageTab from "./Composer/ComposerMessageTab.svelte";
  import { InlineReplies } from "./Composer/InlineReplies";
  import ThreePane from "./3pane/3Pane.svelte";
  import type MessageListPane from "./3pane/MessageListPane.svelte";
  import MessagePrint from "./Message/MessagePrint.svelte";
  import MessageMovePopup, { openMoveMessages } from "./Message/MessageMovePopup.svelte";
  import NewFolderDialog, { openNewFolder } from "./LeftPane/NewFolderDialog.svelte";
  import MoveFolderDialog, { openMoveFolder } from "./LeftPane/MoveFolderDialog.svelte";
  import GoToFolderDialog from "./LeftPane/GoToFolderDialog.svelte";
  import FolderProperties, { openFolderProperties } from "./FolderProperties.svelte";
  import ReadingPaneOptionsDialog, { openReadingPaneOptions } from "./Message/ReadingPaneOptionsDialog.svelte";
  import ColorCategoriesDialog, { openColorCategories } from "../Shared/Tag/ColorCategoriesDialog.svelte";
  import SavedSearchUI, { openSaveSearch } from "./Search/SavedSearchUI.svelte";
  import RulesFromSearchUI, { openRulesFromSearch } from "./Search/RulesFromSearchUI.svelte";
  import AlwaysMoveDialog, { openAlwaysMove } from "./Rules/AlwaysMoveDialog.svelte";
  import SearchPersonDialog, { openSearchPerson } from "./Search/SearchPersonDialog.svelte";
  import SharedFolderDialog, { openSharedFolder } from "./LeftPane/SharedFolderDialog.svelte";
  import NewSearchFolderDialog, { openNewSearchFolder } from "./Search/NewSearchFolderDialog.svelte";
  import CustomizeSearchFolderDialog, { openCustomizeSearchFolder } from "./Search/CustomizeSearchFolderDialog.svelte";
  import { SearchFolderCustomizing } from "./Search/SearchFolderCriteria";
  import ViewSettingsDialog, { openViewSettings } from "./ViewSettings/ViewSettingsDialog.svelte";
  import ShowColumnsDialog, { openShowColumns } from "./ViewSettings/ShowColumnsDialog.svelte";
  import ApplyViewDialog, { openApplyView } from "./ViewSettings/ApplyViewDialog.svelte";
  import ApplyScopeDialog, { askedScope } from "./ViewSettings/ApplyScopeDialog.svelte";
  import { MailViewSettings } from "./ViewSettings/ViewSettings";
  import ConnectedIcon from "lucide-svelte/icons/plug-zap";
  import DisconnectedIcon from "lucide-svelte/icons/unplug";
  import ErrorIcon from "lucide-svelte/icons/circle-alert";
  import FilterIcon from "lucide-svelte/icons/funnel";
  import { ArrayColl, type Collection } from "svelte-collections";
  import { derived, get, type Readable } from "svelte/store";
  import { useLocation } from "svelte-navigator";
  import { onDestroy, tick } from "svelte";
  import debounce from "lodash/debounce";
  import { t } from "../../l10n/l10n";

  const folderPane = getLocalStorage<FolderPaneMode>("lookout.mail.folderPane", FolderPaneMode.Normal);
  const searchOptions = MailSearch.options;
  const updatingFolders = MessageActions.updatingFolders;
  const accounts = appGlobal.emailAccounts;
  const inlineRibbon = InlineReplies.ribbon;

  let pageEl: HTMLElement;
  let listPane: MessageListPane;

  if (!$selectedMessages) {
    $selectedMessages = new ArrayColl<EMail>();
  }
  $: selection = $selectedMessages;
  $: selectedArray = selectionArray($selection);
  function selectionArray(current: ArrayColl<EMail>): Readable<EMail[]> {
    let messages = current.contents;
    return derived(messages, () => messages);
  }

  $: location = useLocation();
  $: params = getParams($location?.state);
  $: params, setFolderFromParams();
  // <copied from="../../frontend/Mail/MailRoutes.svelte">
  let lastAccount = null;
  let lastFolder = null;
  function setFolderFromParams() {
    if (params?.account && params.account != lastAccount) {
      $selectedAccount = params.account;
      lastAccount = params.account;
    }
    if (params?.folder && params.folder != lastFolder) {
      $selectedFolder = params.folder;
      lastFolder = params.folder;
    }
  }
  // </copied>

  $: initialAccount = $selectedAccount ?? $accounts.first;
  $: rootFolders = initialAccount?.rootFolders;
  $: $rootFolders, selectInbox();
  function selectInbox() {
    if ($selectedFolder && $selectedFolder.account == $selectedAccount) {
      return;
    }
    if (!$selectedAccount && initialAccount) {
      $selectedAccount = initialAccount;
    }
    $selectedFolder = $selectedAccount?.inbox ?? null;
  }

  let isLoading = false;
  let shownFolder: Folder | null = null;
  $: $selectedFolder, catchErrors(() => onFolderChanged($selectedFolder));
  async function onFolderChanged(folder: Folder) {
    if (folder == shownFolder) {
      return;
    }
    if (shownFolder && hasSearchCriteria) {
      closeSearch();
    }
    shownFolder = folder;
    isAutoSelectPending = true;
    listPane?.scrollToTop();
    await loadFolder(folder);
  }

  // <copied from="../../frontend/Mail/MailRoutes.svelte">
  async function loadFolder(folder: Folder) {
    if (!folder) {
      return;
    }
    try {
      if ($selectedMessage?.folder != folder) {
        $selectedMessage = null;
        selection?.clear();
      }
      isLoading = true;
      await folder.getRecentMessages();
    } catch (ex) {
      if (!ex.authFail) {
        folder.account.errorCallback(ex);
      }
    } finally {
      isLoading = false;
    }
  }
  // </copied>

  let filteredMessages: Collection<EMail> | null = null;
  let folderMessages: Collection<EMail> | null = null;
  $: if ($selectedFolder?.messages != folderMessages) {
    folderMessages = $selectedFolder?.messages ?? null;
  }
  // <copied from="../../frontend/Mail/LeftPane/FolderFooter.svelte">
  $: quickSearch.folder = $selectedFolder;
  // </copied>
  const quickFilterList = new QuickFilterList();
  $: $selectedFolder && $quickSearch && $folderMessages && $selection && catchErrors(startQuickSearch, showError);
  async function startQuickSearch() {
    filteredMessages = await quickFilterList.filter(quickSearch, selection);
  }
  $: hasFilter = $quickSearch && quickSearch.hasSearch();

  $: searchTerm = $globalSearchTerm?.trim() || null;
  let isSearchFocused = false;
  $: hasSearchCriteria = MailSearch.hasCriteria(searchTerm, $searchOptions);
  $: isSearchActive = hasSearchCriteria || isSearchFocused;
  let currentSearch: SearchEMail | null = null;
  let searchResults: Collection<EMail> | null = null;
  let isSearching = false;
  $: searchTerm, $searchOptions, startSearchDebounced();
  const startSearchDebounced = debounce(() => catchErrors(startSearch), 300);
  let lastCriteria: string = null;
  async function startSearch() {
    if (!MailSearch.hasCriteria(searchTerm, $searchOptions)) {
      currentSearch = null;
      searchResults = null;
      lastCriteria = null;
      return;
    }
    let search = MailSearch.newSearch(searchTerm, $searchOptions, $selectedAccount, $selectedFolder);
    // <copied from="../../frontend/Mail/Search/SearchPane.svelte">
    let criteria = JSON.stringify(search.toJSON());
    if (criteria == lastCriteria) {
      return; // backstop to break loops
    }
    lastCriteria = criteria;
    // </copied>
    currentSearch = search;
    searchResults = new ArrayColl<EMail>();
    $selectedMessage = null;
    isAutoSelectPending = true;
    isSearching = true;
    try {
      let result = await MailSearch.startSearch(search);
      if (currentSearch == search) {
        searchResults = result;
      }
    } finally {
      if (currentSearch == search) {
        isSearching = false;
      }
    }
  }
  onDestroy(() => startSearchDebounced.cancel());

  let isShowingAllResults = false;
  $: currentSearch, isShowingAllResults = false;
  async function showAllResults() {
    let search = currentSearch;
    isShowingAllResults = true;
    isSearching = true;
    try {
      let result = await MailSearch.startSearch(search, false);
      if (currentSearch == search) {
        searchResults = result;
      }
    } finally {
      if (currentSearch == search) {
        isSearching = false;
      }
    }
  }

  function closeSearch() {
    MailSearch.close();
    isSearchFocused = false;
    TitleBarSearch.input?.blur();
  }

  function onFocusChange() {
    setTimeout(() => {
      let input = TitleBarSearch.input;
      isSearchFocused = !!input && document.activeElement == input;
    }, 0);
  }

  let listMessages: Collection<EMail> = new ArrayColl<EMail>();
  $: updateListMessages(searchResults, hasFilter, filteredMessages, folderMessages);
  function updateListMessages(results: Collection<EMail>, isFiltered: boolean, filtered: Collection<EMail>, all: Collection<EMail>) {
    let list = results ?? (isFiltered ? filtered : null) ?? all ?? new ArrayColl<EMail>();
    if (list != listMessages) {
      listMessages = list;
    }
  }

  let isAutoSelectPending = true;
  $: if (isAutoSelectPending && $listMessages?.hasItems && listPane) {
    catchErrors(autoSelectFirst);
  }
  async function autoSelectFirst() {
    isAutoSelectPending = false;
    await tick();
    if (!$selectedMessage) {
      listPane?.selectRelative(0);
    }
  }

  $: unreadStore = FolderTreeActions.countStore($selectedFolder, false);
  $: totalStore = FolderTreeActions.countStore($selectedFolder, true);
  $: statusItemsLeft = statusLeft($listMessages, $unreadStore, $totalStore, hasFilter, searchResults, isSearching, $selectedArray, isShowingAllResults);
  function statusLeft(messages: Collection<EMail>, unread: number, total: number, isFiltered: boolean, results: Collection<EMail> | null,
      searching: boolean, selected: EMail[], _showingAll: boolean) {
    let items = [];
    if (results) {
      items.push({ label: searching
        ? $t`Searching…`
        : MailSearch.isLimitReached(results) && !isShowingAllResults
          ? $t`More than ${MailSearch.kLimit} results`
          : $t`Results: ${results.length}`, busy: searching });
    } else if (isFiltered) {
      items.push({ label: $t`Filter applied`, icon: FilterIcon });
      items.push({ label: $t`Items: ${messages.length}` });
    } else {
      items.push({ label: $t`Items: ${Math.max(total, messages.length)}` });
      if (unread) {
        items.push({ label: $t`Unread: ${unread}` });
      }
    }
    if (selected.length > 1) {
      items.push({ label: $t`Selected: ${selected.length}` });
    }
    return items;
  }

  $: statusAccounts = MailSearch.isRealFolder($selectedFolder) ? [$selectedFolder.account] : $accounts.contents;
  $: accountStates = derived(statusAccounts, () => statusAccounts);
  $: statusItemsRight = statusRight($accountStates, $updatingFolders);
  const ribbonCollapsed = getLocalStorage<boolean>("lookout.ribbon.collapsed", false);
  $: statusViews = viewButtons($folderPane.value == FolderPaneMode.Minimized && !!$ribbonCollapsed.value);
  function viewButtons(isReading: boolean): StatusBarView[] {
    return [
      { label: $t`Normal`, icon: NormalViewIcon, isActive: !isReading, onClick: () => setReadingView(false) },
      { label: $t`Reading`, icon: ReadingViewIcon, isActive: isReading, onClick: () => setReadingView(true) },
    ];
  }
  function setReadingView(isReading: boolean) {
    $folderPane.value = isReading ? FolderPaneMode.Minimized : FolderPaneMode.Normal;
    $ribbonCollapsed.value = isReading;
  }
  function statusRight(states: typeof statusAccounts, updating: Folder[]) {
    let items = [];
    if (updating.length) {
      items.push({ label: $t`Updating ${FolderTreeActions.displayName(updating[0])}…`, busy: true });
    }
    let failed = states.filter(account => account.fatalError);
    let offline = states.filter(account => !account.isLoggedIn && !account.fatalError);
    if (failed.length) {
      items.push({
        label: failed.length == 1 ? $t`Error in ${failed[0].name}` : $t`${failed.length} accounts have errors`,
        icon: ErrorIcon,
        tooltip: failed.map(account => account.name + ": " + account.fatalError.message).join("\n"),
      });
    }
    if (offline.length) {
      items.push({
        label: states.length == 1 ? $t`Disconnected` : $t`Disconnected: ${offline.map(account => account.name).join(", ")}`,
        icon: DisconnectedIcon,
      });
    } else if (states.length && !failed.length) {
      items.push({ label: $t`Connected`, icon: ConnectedIcon });
    }
    return items;
  }

  let status: StatusBarContent;
  $: status = { left: statusItemsLeft, right: statusItemsRight, views: statusViews };
  // <copied to="../Calendar/CalendarApp.svelte, ../Contacts/ContactsAppD.svelte">
  $: $statusBarContent = status;
  onDestroy(() => {
    if (get(statusBarContent) == status) {
      statusBarContent.set(null);
    }
  });
  // </copied>

  let isGoToFolderOpen = false;

  function onScopeClosed() {
    $askedScope.onChoice(null);
    $askedScope = null;
  }

  onDestroy(() => {
    $openMoveMessages = null;
    $openNewFolder = null;
    $openMoveFolder = null;
    $openFolderProperties = null;
    $openReadingPaneOptions = false;
    $openColorCategories = null;
    $openSaveSearch = null;
    $openRulesFromSearch = null;
    $openAlwaysMove = null;
    $openSearchPerson = null;
    $openSharedFolder = null;
    $openNewSearchFolder = null;
    $openCustomizeSearchFolder = null;
    $openViewSettings = null;
    $openShowColumns = null;
    $openApplyView = null;
    $askedScope?.onChoice(null);
    $askedScope = null;
  });

  function onKeyDown(event: KeyboardEvent) {
    if (event.defaultPrevented || document.querySelector("dialog:modal")) {
      return;
    }
    let target = event.target as HTMLElement;
    let isInSearchBox = target == TitleBarSearch.input;
    if (!pageEl?.contains(target) && target != document.body && !isInSearchBox) {
      return;
    }
    if (event.key == "Escape" && isSearchActive && (isInSearchBox || !Keyboard.isTextField(target))) {
      event.preventDefault();
      closeSearch();
      return;
    }
    let action = MailKeys.actionFor(event);
    if (!action) {
      return;
    }
    if (Keyboard.isTextField(target) && !MailKeys.worksInTextFields(action)) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    catchErrors(() => runAction(action, event));
  }

  async function runAction(action: MailKeyAction, event: KeyboardEvent) {
    let messages = $selectedArray;
    let single = messages.length == 1 ? messages[0] : null;
    let folder = $selectedFolder;
    switch (action) {
      case MailKeyAction.NewMail:
        return MessageActions.newMail(folder);
      case MailKeyAction.SendReceiveAll:
        return await MessageActions.sendReceiveAll();
      case MailKeyAction.UpdateFolder:
        return await MessageActions.getNewMail(folder);
      case MailKeyAction.Search:
        return TitleBarSearch.input?.focus();
      case MailKeyAction.ScopeCurrentFolder:
        MailSearch.update({ scope: SearchScope.CurrentFolder });
        return TitleBarSearch.input?.focus();
      case MailKeyAction.ScopeAllAccounts:
        MailSearch.update({ scope: SearchScope.AllAccounts });
        return TitleBarSearch.input?.focus();
      case MailKeyAction.AdvancedFind:
        MailSearch.isAdvancedSearchOpen.set(true);
        return;
      case MailKeyAction.NewFolder:
        if (MailSearch.isRealFolder(folder)) {
          $openNewFolder = { account: folder.account, parent: folder };
        } else if (MailSearch.isRealAccount($selectedAccount) || $accounts.hasItems) {
          $openNewFolder = { account: MailSearch.isRealAccount($selectedAccount) ? $selectedAccount : $accounts.first, parent: null };
        }
        return;
      case MailKeyAction.NewSearchFolder:
        $openNewSearchFolder = { account: MailSearch.isRealAccount($selectedAccount) ? $selectedAccount : null };
        return;
      case MailKeyAction.GoToFolder:
        isGoToFolderOpen = true;
        return;
      case MailKeyAction.AddressBook:
        return MessageActions.openAddressBook();
      case MailKeyAction.NextMessage:
        return listPane?.selectRelative(1);
      case MailKeyAction.PreviousMessage:
        return listPane?.selectRelative(-1);
    }
    if (!messages.length) {
      return;
    }
    switch (action) {
      case MailKeyAction.Delete:
        return await MessageActions.delete(messages);
      case MailKeyAction.DeletePermanently:
        return await MessageActions.deletePermanently(messages);
      case MailKeyAction.Archive:
        return await MessageActions.archive(messages);
      case MailKeyAction.MarkRead:
        return await MessageActions.markRead(messages, true);
      case MailKeyAction.MarkUnread:
        return await MessageActions.markRead(messages, false);
      case MailKeyAction.ToggleFlag:
        return await MessageActions.toggleFlag(messages);
      case MailKeyAction.MarkJunk:
        return await MessageActions.junk(messages, true);
      case MailKeyAction.NotJunk:
        return await MessageActions.junk(messages, false);
      case MailKeyAction.MoveToFolder:
        $openMoveMessages = { messages, copy: false };
        return;
      case MailKeyAction.CopyToFolder:
        $openMoveMessages = { messages, copy: true };
        return;
    }
    if (!single) {
      return;
    }
    switch (action) {
      case MailKeyAction.Reply:
        return MessageActions.reply(single);
      case MailKeyAction.ReplyAll:
        return MessageActions.replyAll(single);
      case MailKeyAction.Forward:
        return await MessageActions.forward(single, event);
      case MailKeyAction.ForwardAsAttachment:
        return await MessageActions.forwardAsAttachment(single);
      case MailKeyAction.Print:
        return await MessageActions.print(single);
    }
  }
</script>

<style>
  .mail-page {
    min-height: 0;
    min-width: 0;
  }
</style>
