<RibbonTab label={$t`View`}>
  <RibbonGroup label={$t`Current View`}>
    <RibbonMenuButton label={$t`Change View`} shortLabel={$t`Views`} icon={ChangeViewIcon}>
      {#each viewTypes as viewType}
        <MenuItem label={viewType.label} tooltip={viewType.tooltip} icon={viewType.icon}
          checked={$settings.type == viewType.id}
          onClick={() => ViewCommands.changeView(folder, viewType.id)} />
      {/each}
      <MenuDivider />
      <MenuItem label={$t`Apply Current View to Other Mail Folders…`}
        onClick={() => ViewDialogs.open({ kind: "apply-view", folder })} />
    </RibbonMenuButton>
    <RibbonButton label={$t`View Settings`} icon={ViewSettingsIcon} size="small"
      tooltip={$t`Change the columns, grouping, sorting and filter of this view`}
      onClick={() => ViewCommands.openViewSettings(folder)} />
    <RibbonButton label={$t`Reset View`} icon={ResetIcon} size="small"
      tooltip={$t`Reset the message list and the layout to the default settings`}
      onClick={() => MailView.resetView(folder)} />
  </RibbonGroup>
  <RibbonGroup label={$t`Messages`}>
    <RibbonCheckBox label={$t`Show as Conversations`}
      bind:checked={conversationsChecked}
      onChange={onShowAsConversations} />
    <RibbonMenuButton label={$t`Conversation Settings`} shortLabel={$t`Settings`} icon={ConversationSettingsIcon} size="small"
      disabled={!$settings.showAsConversations && $t`Turn on Show as Conversations first`}>
      <MenuItem label={$t`Show Senders Above the Subject`} checked={$settings.showSendersAboveSubject} checkable
        onClick={() => ViewCommands.setConversationOption(folder, { showSendersAboveSubject: !$settings.showSendersAboveSubject })} />
      <MenuItem label={$t`Always Expand Selected Conversation`} checked={$settings.alwaysExpandSelected} checkable
        onClick={() => ViewCommands.setConversationOption(folder, { alwaysExpandSelected: !$settings.alwaysExpandSelected })} />
      <MenuItem label={$t`Use Classic Indented View`} checked={$settings.classicIndented} checkable
        onClick={() => ViewCommands.setConversationOption(folder, { classicIndented: !$settings.classicIndented })} />
    </RibbonMenuButton>
  </RibbonGroup>
  <RibbonGroup label={$t`Arrangement`}>
    <RibbonMenuButton label={$t`Message Preview`} icon={PreviewIcon}>
      {#each previewOptions as option}
        <MenuItem label={option.label} checked={$settings.previewLines == option.lines}
          onClick={() => ViewCommands.setPreviewLines(folder, option.lines)} />
      {/each}
    </RibbonMenuButton>
    <RibbonMenuButton label={$t`Arrange By`} shortLabel={$t`Arrange`} icon={ArrangeIcon}>
      <ArrangeByMenuItems {folder} />
    </RibbonMenuButton>
    <RibbonToggleButton label={$t`Reverse Sort`} icon={ReverseIcon} size="small"
      checked={!!$settings.reverseSort}
      onChange={checked => ViewCommands.setReverseSort(folder, checked)} />
    <RibbonButton label={$t`Add Columns`} icon={AddColumnsIcon} size="small"
      tooltip={$t`Choose the columns of the single-line view`}
      onClick={() => ViewCommands.addColumns(folder)} />
    <RibbonMenuButton label={$t`Expand/Collapse`} icon={ExpandCollapseIcon} size="small"
      disabled={!$settings.showInGroups && $t`Turn on Show in Groups first`}>
      <MenuItem label={$t`Collapse This Group`} icon={CollapseIcon} onClick={() => onCollapseGroup(true)} />
      <MenuItem label={$t`Expand This Group`} icon={ExpandIcon} onClick={() => onCollapseGroup(false)} />
      <MenuDivider />
      <MenuItem label={$t`Collapse All Groups`} icon={CollapseAllIcon} onClick={() => onCollapseAll(true)} />
      <MenuItem label={$t`Expand All Groups`} icon={ExpandAllIcon} onClick={() => onCollapseAll(false)} />
    </RibbonMenuButton>
  </RibbonGroup>
  <RibbonGroup label={$t`Layout`}>
    <RibbonToggleButton label={$t`Use Tighter Spacing`} icon={SpacingIcon}
      checked={!!$settings.tighterSpacing}
      onChange={checked => MailViewSettings.change(folder, { tighterSpacing: checked }, ApplyScope.AllFolders)} />
    <RibbonMenuButton label={$t`Folder Pane`} shortLabel={$t`Folders`} icon={FolderPaneIcon}>
      <MenuItem label={$t`Normal`} checked={$folderPane.value == FolderPaneMode.Normal}
        onClick={() => { $folderPane.value = FolderPaneMode.Normal; }} />
      <MenuItem label={$t`Minimized`} checked={$folderPane.value == FolderPaneMode.Minimized}
        onClick={() => { $folderPane.value = FolderPaneMode.Minimized; }} />
      <MenuItem label={$t`Off`} checked={$folderPane.value == FolderPaneMode.Off}
        onClick={() => { $folderPane.value = FolderPaneMode.Off; }} />
      <MenuDivider />
      <MenuItem label={$t`Favorites`} checked={$showFavorites.value} checkable
        onClick={() => { $showFavorites.value = !$showFavorites.value; }} />
    </RibbonMenuButton>
    <RibbonMenuButton label={$t`Reading Pane`} shortLabel={$t`Reading`} icon={ReadingPaneIcon}>
      <MenuItem label={$t`Right`} icon={RightIcon} checked={$readingPane.value == ReadingPanePosition.Right}
        onClick={() => { $readingPane.value = ReadingPanePosition.Right; }} />
      <MenuItem label={$t`Bottom`} icon={BottomIcon} checked={$readingPane.value == ReadingPanePosition.Bottom}
        onClick={() => { $readingPane.value = ReadingPanePosition.Bottom; }} />
      <MenuItem label={$t`Off`} icon={OffIcon} checked={$readingPane.value == ReadingPanePosition.Off}
        onClick={() => { $readingPane.value = ReadingPanePosition.Off; }} />
      <MenuDivider />
      <MenuItem label={$t`Options…`} onClick={() => MailDialogs.open({ kind: "reading-pane-options" })} />
    </RibbonMenuButton>
    <RibbonMenuButton label={$t`To-Do Bar`} icon={ToDoBarIcon}>
      <MenuItem label={$t`Calendar`} icon={CalendarIcon} checkable checked={$toDoBar.value?.includes(ToDoBarPart.Calendar)}
        onClick={() => MailView.setToDoBarPart(ToDoBarPart.Calendar, !$toDoBar.value?.includes(ToDoBarPart.Calendar))} />
      <MenuItem label={$t`People`} icon={PeopleIcon} checkable checked={$toDoBar.value?.includes(ToDoBarPart.People)}
        onClick={() => MailView.setToDoBarPart(ToDoBarPart.People, !$toDoBar.value?.includes(ToDoBarPart.People))} />
      <MenuDivider />
      <MenuItem label={$t`Off`} checked={!$toDoBar.value?.length}
        onClick={() => { $toDoBar.value = []; }} />
    </RibbonMenuButton>
  </RibbonGroup>
</RibbonTab>

<script lang="ts">
  import type { Folder } from "../../../logic/Mail/Folder";
  import { FolderPaneMode, MailView, ReadingPanePosition, ToDoBarPart } from "../MailView";
  import { ApplyScope, MailViewSettings, ViewType } from "../View/ViewSettings";
  import { ViewCommands } from "../View/ViewCommands";
  import { ViewDialogs } from "../View/ViewDialogs";
  import { MailDialogs } from "../Dialogs/MailDialogs";
  import ArrangeByMenuItems from "../View/ArrangeByMenuItems.svelte";
  import RibbonTab from "../../Shared/Ribbon/RibbonTab.svelte";
  import RibbonGroup from "../../Shared/Ribbon/RibbonGroup.svelte";
  import RibbonButton from "../../Shared/Ribbon/RibbonButton.svelte";
  import RibbonToggleButton from "../../Shared/Ribbon/RibbonToggleButton.svelte";
  import RibbonMenuButton from "../../Shared/Ribbon/RibbonMenuButton.svelte";
  import RibbonCheckBox from "../../Shared/Ribbon/RibbonCheckBox.svelte";
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";
  import MenuDivider from "../../Shared/Menu/MenuDivider.svelte";
  import ChangeViewIcon from "lucide-svelte/icons/layout-list";
  import CompactIcon from "lucide-svelte/icons/rows-2";
  import SingleIcon from "lucide-svelte/icons/list";
  import PreviewViewIcon from "lucide-svelte/icons/scroll-text";
  import ViewSettingsIcon from "lucide-svelte/icons/settings-2";
  import ResetIcon from "lucide-svelte/icons/rotate-ccw";
  import PreviewIcon from "lucide-svelte/icons/text-quote";
  import ArrangeIcon from "lucide-svelte/icons/arrow-down-up";
  import ReverseIcon from "lucide-svelte/icons/arrow-up-down";
  import AddColumnsIcon from "lucide-svelte/icons/columns-3";
  import ConversationSettingsIcon from "lucide-svelte/icons/message-square-more";
  import ExpandCollapseIcon from "lucide-svelte/icons/list-collapse";
  import FolderPaneIcon from "lucide-svelte/icons/panel-left";
  import ReadingPaneIcon from "lucide-svelte/icons/columns-2";
  import RightIcon from "lucide-svelte/icons/panel-right";
  import BottomIcon from "lucide-svelte/icons/panel-bottom";
  import OffIcon from "lucide-svelte/icons/square";
  import SpacingIcon from "lucide-svelte/icons/fold-vertical";
  import ToDoBarIcon from "lucide-svelte/icons/panel-right-open";
  import CalendarIcon from "lucide-svelte/icons/calendar";
  import PeopleIcon from "lucide-svelte/icons/users";
  import CollapseIcon from "lucide-svelte/icons/chevron-up";
  import ExpandIcon from "lucide-svelte/icons/chevron-down";
  import CollapseAllIcon from "lucide-svelte/icons/chevrons-down-up";
  import ExpandAllIcon from "lucide-svelte/icons/chevrons-up-down";
  import { gt, t } from "../../../l10n/l10n";

  export let folder: Folder | null;
  export let onCollapseGroup: (collapsed: boolean) => void;
  export let onCollapseAll: (collapsed: boolean) => void;

  const folderPane = MailView.folderPane;
  const readingPane = MailView.readingPane;
  const showFavorites = MailView.showFavorites;
  const toDoBar = MailView.toDoBar;
  $: settings = MailViewSettings.store(folder);
  let conversationsChecked = false;
  $: conversationsChecked = !!$settings.showAsConversations;

  async function onShowAsConversations(checked: boolean) {
    await ViewCommands.setShowAsConversations(folder, checked);
    conversationsChecked = !!MailViewSettings.of(folder).showAsConversations;
  }

  const viewTypes = [
    { id: ViewType.Compact, label: gt`Compact`, icon: CompactIcon, tooltip: gt`Sender, subject and preview in a narrow list` },
    { id: ViewType.Single, label: gt`Single`, icon: SingleIcon, tooltip: gt`One line per message, in columns` },
    { id: ViewType.Preview, label: gt`Preview`, icon: PreviewViewIcon, tooltip: gt`One line per message in columns, with a preview of the text` },
  ];
  const previewOptions = [
    { lines: 0, label: gt`Off` },
    { lines: 1, label: gt`1 Line` },
    { lines: 2, label: gt`2 Lines` },
    { lines: 3, label: gt`3 Lines` },
  ];
</script>
