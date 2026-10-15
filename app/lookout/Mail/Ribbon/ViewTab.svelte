<RibbonTab label={$t`View`}>
  <RibbonGroup label={$t`Current View`}>
    <RibbonButton label={$t`Reset View`} icon={ResetIcon}
      tooltip={$t`Reset the message list and the layout to the default settings`}
      onClick={() => MailView.resetView()} />
  </RibbonGroup>
  <RibbonGroup label={$t`Messages`}>
    <RibbonToggleButton label={$t`Show as Conversations`} icon={ConversationsIcon}
      checked={!!$showAsConversations.value}
      onChange={checked => { $showAsConversations.value = checked; }} />
  </RibbonGroup>
  <RibbonGroup label={$t`Arrangement`}>
    <RibbonMenuButton label={$t`Message Preview`} icon={PreviewIcon}>
      {#each previewOptions as option}
        <MenuItem label={option.label} icon={$previewLines.value == option.lines ? CheckIcon : BlankIcon}
          onClick={() => $previewLines.value = option.lines} />
      {/each}
    </RibbonMenuButton>
    <RibbonMenuButton label={$t`Arrange By`} icon={ArrangeIcon}>
      {#each arrangements as arrangement}
        <MenuItem label={arrangement.label} icon={$arrangeBy.value == arrangement.id ? CheckIcon : BlankIcon}
          onClick={() => $arrangeBy.value = arrangement.id} />
      {/each}
    </RibbonMenuButton>
    <RibbonToggleButton label={$t`Reverse Sort`} icon={ReverseIcon}
      checked={!!$reverseSort.value}
      onChange={checked => { $reverseSort.value = checked; }} />
    <RibbonToggleButton label={$t`Show in Groups`} icon={GroupsIcon}
      checked={!!$showInGroups.value}
      onChange={checked => { $showInGroups.value = checked; }} />
    <RibbonMenuButton label={$t`Expand/ Collapse`} icon={ExpandCollapseIcon}
      disabled={!$showInGroups.value && $t`Turn on Show in Groups first`}>
      <MenuItem label={$t`Collapse This Group`} icon={CollapseIcon} onClick={() => onCollapseGroup(true)} />
      <MenuItem label={$t`Expand This Group`} icon={ExpandIcon} onClick={() => onCollapseGroup(false)} />
      <MenuDivider />
      <MenuItem label={$t`Collapse All Groups`} icon={CollapseAllIcon} onClick={() => onCollapseAll(true)} />
      <MenuItem label={$t`Expand All Groups`} icon={ExpandAllIcon} onClick={() => onCollapseAll(false)} />
    </RibbonMenuButton>
  </RibbonGroup>
  <RibbonGroup label={$t`Layout`}>
    <RibbonMenuButton label={$t`Folder Pane`} icon={FolderPaneIcon}>
      <MenuItem label={$t`Normal`} icon={$folderPane.value == FolderPaneMode.Normal ? CheckIcon : BlankIcon}
        onClick={() => $folderPane.value = FolderPaneMode.Normal} />
      <MenuItem label={$t`Minimized`} icon={$folderPane.value == FolderPaneMode.Minimized ? CheckIcon : BlankIcon}
        onClick={() => $folderPane.value = FolderPaneMode.Minimized} />
      <MenuItem label={$t`Off`} icon={$folderPane.value == FolderPaneMode.Off ? CheckIcon : BlankIcon}
        onClick={() => $folderPane.value = FolderPaneMode.Off} />
    </RibbonMenuButton>
    <RibbonMenuButton label={$t`Reading Pane`} icon={ReadingPaneIcon}>
      <MenuItem label={$t`Right`} icon={$readingPane.value == ReadingPanePosition.Right ? CheckIcon : RightIcon}
        onClick={() => $readingPane.value = ReadingPanePosition.Right} />
      <MenuItem label={$t`Bottom`} icon={$readingPane.value == ReadingPanePosition.Bottom ? CheckIcon : BottomIcon}
        onClick={() => $readingPane.value = ReadingPanePosition.Bottom} />
      <MenuItem label={$t`Off`} icon={$readingPane.value == ReadingPanePosition.Off ? CheckIcon : OffIcon}
        onClick={() => $readingPane.value = ReadingPanePosition.Off} />
      <MenuDivider />
      <MenuItem label={$t`Options…`} icon={OptionsIcon} onClick={() => MailDialogs.open({ kind: "reading-pane-options" })} />
    </RibbonMenuButton>
  </RibbonGroup>
  <RibbonGroup label={$t`Message`}>
    <RibbonMenuButton label={$t`Message Format`} icon={FormatIcon}>
      {#each displayModes as mode}
        <MenuItem label={mode.label} tooltip={mode.tooltip}
          icon={$contentRendering.value == mode.id ? CheckIcon : BlankIcon}
          onClick={() => $contentRendering.value = mode.id} />
      {/each}
    </RibbonMenuButton>
  </RibbonGroup>
</RibbonTab>

<script lang="ts">
  import { DisplayMode } from "../../../frontend/Mail/Message/MessageBody.svelte";
  import { ArrangeBy } from "../MessageList/MessageGrouping";
  import { FolderPaneMode, MailView, ReadingPanePosition } from "../MailView";
  import { MailDialogs } from "../Dialogs/MailDialogs";
  import RibbonTab from "../../Shared/Ribbon/RibbonTab.svelte";
  import RibbonGroup from "../../Shared/Ribbon/RibbonGroup.svelte";
  import RibbonButton from "../../Shared/Ribbon/RibbonButton.svelte";
  import RibbonToggleButton from "../../Shared/Ribbon/RibbonToggleButton.svelte";
  import RibbonMenuButton from "../../Shared/Ribbon/RibbonMenuButton.svelte";
  import MenuItem from "../../../frontend/Shared/Menu/MenuItem.svelte";
  import MenuDivider from "../../../frontend/Shared/Menu/MenuDivider.svelte";
  import ResetIcon from "lucide-svelte/icons/rotate-ccw";
  import PreviewIcon from "lucide-svelte/icons/text-quote";
  import ArrangeIcon from "lucide-svelte/icons/arrow-down-up";
  import ReverseIcon from "lucide-svelte/icons/arrow-up-down";
  import GroupsIcon from "lucide-svelte/icons/list-tree";
  import ConversationsIcon from "lucide-svelte/icons/messages-square";
  import ExpandCollapseIcon from "lucide-svelte/icons/list-collapse";
  import FolderPaneIcon from "lucide-svelte/icons/panel-left";
  import ReadingPaneIcon from "lucide-svelte/icons/columns-2";
  import RightIcon from "lucide-svelte/icons/panel-right";
  import BottomIcon from "lucide-svelte/icons/panel-bottom";
  import OffIcon from "lucide-svelte/icons/square";
  import FormatIcon from "lucide-svelte/icons/file-code";
  import CollapseIcon from "lucide-svelte/icons/chevron-up";
  import ExpandIcon from "lucide-svelte/icons/chevron-down";
  import CollapseAllIcon from "lucide-svelte/icons/chevrons-down-up";
  import ExpandAllIcon from "lucide-svelte/icons/chevrons-up-down";
  import OptionsIcon from "lucide-svelte/icons/settings-2";
  import CheckIcon from "lucide-svelte/icons/check";
  import BlankIcon from "../Menu/BlankIcon.svelte";
  import { gt, t } from "../../../l10n/l10n";

  export let onCollapseGroup: (collapsed: boolean) => void;
  export let onCollapseAll: (collapsed: boolean) => void;

  const previewLines = MailView.previewLines;
  const arrangeBy = MailView.arrangeBy;
  const reverseSort = MailView.reverseSort;
  const showInGroups = MailView.showInGroups;
  const showAsConversations = MailView.showAsConversations;
  const folderPane = MailView.folderPane;
  const readingPane = MailView.readingPane;
  const contentRendering = MailView.contentRendering;

  const previewOptions = [
    { lines: 0, label: gt`Off` },
    { lines: 1, label: gt`1 Line` },
    { lines: 2, label: gt`2 Lines` },
    { lines: 3, label: gt`3 Lines` },
  ];
  const arrangements = [
    { id: ArrangeBy.Date, label: gt`Date` },
    { id: ArrangeBy.From, label: gt`From` },
    { id: ArrangeBy.Subject, label: gt`Subject` },
    { id: ArrangeBy.Size, label: gt`Size` },
    { id: ArrangeBy.Importance, label: gt`Importance` },
    { id: ArrangeBy.Flag, label: gt`Flag Status` },
  ];
  const displayModes = [
    { id: DisplayMode.HTML, label: gt`Formatted`, tooltip: gt`Show the message as the sender formatted it, without content from the Internet` },
    { id: DisplayMode.HTMLWithExternal, label: gt`With Pictures from the Internet`, tooltip: gt`Also load pictures from the Internet. This allows the sender to track you.` },
    { id: DisplayMode.Plaintext, label: gt`Plain Text`, tooltip: gt`Show only the text of the message` },
    { id: DisplayMode.Source, label: gt`Source`, tooltip: gt`Show the on-the-wire format of the message` },
  ];
</script>
