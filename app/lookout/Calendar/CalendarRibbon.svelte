<Ribbon>
  <RibbonTab label={$t`Home`}>
    <RibbonGroup label={$t`New`}>
      <RibbonButton label={$t`New Appointment`} shortLabel={$t`New Event`} icon={NewAppointmentIcon} shortCutInfo="Ctrl+N"
        onClick={() => CalendarActions.newEventAtSelection(null)}
        disabled={noCalendar} />
      <RibbonButton label={$t`New Meeting`} icon={NewMeetingIcon} shortCutInfo="Ctrl+Shift+Q"
        onClick={() => CalendarActions.newEventAtSelection(null, "meeting")}
        disabled={noCalendar} />
      <RibbonMenuButton label={$t`New Items`} icon={NewItemsIcon} disabled={noCalendar}>
        <NewEventMenu />
      </RibbonMenuButton>
    </RibbonGroup>
    <RibbonGroup label={$t`Online Meeting`}>
      <RibbonButton label={$t`New Online Meeting`} shortLabel={$t`Online *=> New online meeting`} icon={OnlineMeetingIcon}
        tooltip={$t`New meeting with a link to an online meeting`}
        onClick={() => CalendarActions.newEventAtSelection(null, "online-meeting")}
        disabled={noCalendar} />
    </RibbonGroup>
    <RibbonGroup label={$t`Go To`} onLauncher={onGoToDate} launcherTooltip={$t`Go To Date (Ctrl+G)`}>
      <RibbonButton label={$t`Today`} icon={TodayIcon} onClick={onToday} />
      <RibbonButton label={$t`Next 7 Days`} icon={NextDaysIcon} onClick={onNext7Days} />
      {#if isSimplified}
        <RibbonButton label={$t`Go To Date`} icon={GoToDateIcon} shortCutInfo="Ctrl+G" onClick={onGoToDate} />
      {/if}
    </RibbonGroup>
    <RibbonGroup label={$t`Arrange`} onLauncher={onCalendarOptions} launcherTooltip={$t`Calendar Options`}>
      <ArrangeButtons {view} {isTable} onView={onView} />
    </RibbonGroup>
    <RibbonGroup label={$t`Manage Calendars`}>
      <RibbonMenuButton label={$t`Open Calendar`} icon={OpenCalendarIcon}>
        <OpenCalendarMenuItems />
      </RibbonMenuButton>
    </RibbonGroup>
    <RibbonGroup label={$t`Share`}>
      <RibbonButton label={$t`Share Calendar`} icon={ShareIcon}
        onClick={() => CalendarActions.openSharing($selectedCalendar)}
        disabled={!canShare && $t`This calendar cannot be shared`} />
      <RibbonButton label={$t`Calendar Permissions`} icon={PermissionsIcon}
        onClick={() => CalendarActions.openSharing($selectedCalendar)}
        disabled={!canShare && $t`This calendar cannot be shared`} />
    </RibbonGroup>
    <RibbonGroup label={$t`Find`}>
      <SearchPeopleBox onChoose={contact => ContactActions.show(contact)} />
      <RibbonButton label={$t`Address Book`} icon={AddressBookIcon} shortCutInfo="Ctrl+Shift+B" size="small"
        onClick={() => CalendarActions.openAddressBook()} />
    </RibbonGroup>
  </RibbonTab>
  <RibbonTab label={$t`Send / Receive`}>
    <RibbonGroup label={$t`Send & Receive`}>
      <RibbonButton label={$t`Update Folder`} shortLabel={$t`Update`} icon={SyncIcon}
        tooltip={$t`Get the latest events of the selected calendar`}
        onClick={() => CalendarActions.update([ $selectedCalendar ])}
        disabled={noSelection} />
      <RibbonButton label={$t`Update All`} icon={SyncAllIcon}
        tooltip={$t`Get the latest events of all calendars`}
        onClick={() => CalendarActions.update($calendars.contents)}
        disabled={noCalendar} />
    </RibbonGroup>
  </RibbonTab>
  <RibbonTab label={$t`Folder`}>
    <RibbonGroup label={$t`New`}>
      <RibbonButton label={$t`New Calendar`} shortLabel={$t`New`} icon={NewCalendarIcon}
        tooltip={$t`Create a new calendar on this computer`}
        onClick={() => CalendarActions.createBlankCalendar()} />
    </RibbonGroup>
    <RibbonGroup label={$t`Actions`}>
      <RibbonButton label={$t`Rename Calendar`} shortLabel={$t`Rename`} icon={RenameIcon}
        tooltip={$t`Rename the calendar in this app`}
        onClick={() => CalendarActions.rename($selectedCalendar)}
        disabled={noSelection} />
      <RibbonButton label={$t`Delete Calendar`} shortLabel={$t`Delete`} icon={DeleteIcon}
        tooltip={$t`Remove the calendar from this app`}
        onClick={() => onDeleteCalendar()}
        disabled={!canDelete && $t`Only calendars that you added or opened yourself can be removed here`} />
    </RibbonGroup>
    <RibbonGroup label={$t`Open & Share`}>
      <RibbonMenuButton label={$t`Open Calendar`} shortLabel={$t`Open *=> Open calendar`} icon={OpenCalendarIcon}
        tooltip={$t`Open Calendar`}>
        <OpenCalendarMenuItems />
      </RibbonMenuButton>
      <RibbonButton label={$t`Share Calendar`} shortLabel={$t`Share`} icon={ShareIcon}
        tooltip={$t`Share Calendar`}
        onClick={() => CalendarActions.openSharing($selectedCalendar)}
        disabled={!canShare && $t`This calendar cannot be shared`} />
      <RibbonButton label={$t`Calendar Permissions`} shortLabel={$t`Permissions`} icon={PermissionsIcon}
        tooltip={$t`Calendar Permissions`}
        onClick={() => CalendarActions.openSharing($selectedCalendar)}
        disabled={!canShare && $t`This calendar cannot be shared`} />
    </RibbonGroup>
    <RibbonGroup label={$t`Properties`}>
      <RibbonButton label={$t`Calendar Properties`} shortLabel={$t`Properties`} icon={PropertiesIcon}
        tooltip={$t`Calendar Properties`}
        onClick={() => CalendarActions.openProperties($selectedCalendar)}
        disabled={noSelection} />
    </RibbonGroup>
  </RibbonTab>
  <RibbonTab label={$t`View`}>
    <RibbonGroup label={$t`Current View`}>
      <RibbonMenuButton label={$t`Change View`} shortLabel={$t`Views`} icon={ChangeViewIcon}>
        <ChangeViewGallery views={calendarViews} {currentView} onChange={onCurrentView} />
      </RibbonMenuButton>
      <RibbonButton label={$t`View Settings`} icon={ViewSettingsIcon}
        onClick={() => CalendarActions.openViewSettings()} />
      <RibbonButton label={$t`Reset View`} icon={ResetViewIcon}
        tooltip={$t`Reset the view and the table columns to the default settings`}
        onClick={onResetView} />
    </RibbonGroup>
    <RibbonGroup label={$t`Arrangement`} onLauncher={onCalendarOptions} launcherTooltip={$t`Calendar Options`}>
      <ArrangeButtons {view} {isTable} onView={onView} />
      <RibbonMenuButton label={$t`Time Scale`} icon={TimeScaleIcon} size="small"
        disabled={view == "month" && $t`The time scale applies to the Day, Work Week, Week and Schedule views`}>
        {#each CalendarSettings.timeScales as scale}
          <MenuItem label={CalendarSettings.timeScaleLabel(scale)} checked={scale == timeScale}
            onClick={() => onTimeScale(scale)} />
        {/each}
      </RibbonMenuButton>
      <RibbonToggleButton label={$t`Overlay`} icon={OverlayIcon} size="small"
        tooltip={$t`Show the calendars on top of each other, instead of side by side`}
        checked={!splitView}
        disabled={overlayDisabled}
        onChange={checked => onOverlay(checked)} />
    </RibbonGroup>
    <RibbonGroup label={$t`Color`}>
      <RibbonMenuButton label={$t`Color`} icon={ColorIcon}
        disabled={noSelection}>
        {#if $selectedCalendar}
          <ColorPalette colors={CalendarColors.palette} selected={$selectedCalendar.color} label={$t`Calendar color`}
            columns={5} onChoose={color => catchErrors(() => CalendarColors.setColor($selectedCalendar, color))} />
        {/if}
      </RibbonMenuButton>
    </RibbonGroup>
    <RibbonGroup label={$t`Layout`}>
      <RibbonMenuButton label={$t`Folder Pane`} shortLabel={$t`Folders`} icon={FolderPaneIcon}>
        <MenuItem label={$t`Normal`} checked={$folderPane.value == CalendarFolderPane.Normal}
          onClick={() => onFolderPane(CalendarFolderPane.Normal)} />
        <MenuItem label={$t`Minimized`} checked={$folderPane.value == CalendarFolderPane.Minimized}
          onClick={() => onFolderPane(CalendarFolderPane.Minimized)} />
        <MenuItem label={$t`Off`} checked={$folderPane.value == CalendarFolderPane.Off}
          onClick={() => onFolderPane(CalendarFolderPane.Off)} />
      </RibbonMenuButton>
      <RibbonMenuButton label={$t`Reading Pane`} shortLabel={$t`Reading`} icon={ReadingPaneIcon}>
        <MenuItem label={$t`Right`} checked={$readingPane.value == ReadingPanePosition.Right}
          onClick={() => { $readingPane.value = ReadingPanePosition.Right; }} />
        <MenuItem label={$t`Bottom`} checked={$readingPane.value == ReadingPanePosition.Bottom}
          onClick={() => { $readingPane.value = ReadingPanePosition.Bottom; }} />
        <MenuItem label={$t`Off`} checked={$readingPane.value == ReadingPanePosition.Off}
          onClick={() => { $readingPane.value = ReadingPanePosition.Off; }} />
      </RibbonMenuButton>
    </RibbonGroup>
    <RibbonDisplayGroup />
  </RibbonTab>
  <slot />
</Ribbon>

<script lang="ts">
  import { CalendarActions } from "./CalendarActions";
  import { CalendarCurrentView, CalendarFolderPane, CalendarSettings, type CalendarViewType } from "./CalendarSettings";
  import { CalendarColors } from "./FolderPane/CalendarColors";
  import { CalendarSharing } from "./Dialogs/CalendarSharing";
  import { SettingsDialogs } from "../Settings/SettingsDialogs";
  import { selectedCalendar } from "../../frontend/Calendar/selected";
  import { getLocalStorage } from "../../frontend/Util/LocalStorage";
  import { catchErrors } from "../../frontend/Util/error";
  import { appGlobal } from "../../logic/app";
  import type { RibbonLayout } from "../Shared/Ribbon/RibbonGroup";
  import Ribbon from "../Shared/Ribbon/Ribbon.svelte";
  import RibbonTab from "../Shared/Ribbon/RibbonTab.svelte";
  import RibbonGroup from "../Shared/Ribbon/RibbonGroup.svelte";
  import RibbonDisplayGroup from "../Shared/Ribbon/RibbonDisplayGroup.svelte";
  import RibbonButton from "../Shared/Ribbon/RibbonButton.svelte";
  import RibbonToggleButton from "../Shared/Ribbon/RibbonToggleButton.svelte";
  import RibbonMenuButton from "../Shared/Ribbon/RibbonMenuButton.svelte";
  import MenuItem from "../Shared/Menu/MenuItem.svelte";
  import ColorPalette from "../Shared/ColorPalette.svelte";
  import ArrangeButtons from "./ArrangeButtons.svelte";
  import SearchPeopleBox from "../Contacts/Search/SearchPeopleBox.svelte";
  import { ContactActions } from "../Contacts/ContactActions";
  import ChangeViewGallery from "../Shared/Ribbon/ChangeViewGallery.svelte";
  import NewEventMenu from "./NewEventMenu.svelte";
  import OpenCalendarMenuItems from "./OpenCalendarMenuItems.svelte";
  import ChangeViewIcon from "lucide-svelte/icons/layout-template";
  import CalendarViewIcon from "lucide-svelte/icons/calendar-days";
  import PreviewViewIcon from "lucide-svelte/icons/scan-text";
  import ListViewIcon from "lucide-svelte/icons/list";
  import ActiveViewIcon from "lucide-svelte/icons/list-todo";
  import ResetViewIcon from "lucide-svelte/icons/rotate-ccw";
  import NewAppointmentIcon from "lucide-svelte/icons/calendar-plus";
  import NewMeetingIcon from "lucide-svelte/icons/users-round";
  import NewItemsIcon from "lucide-svelte/icons/calendar-plus-2";
  import NewCalendarIcon from "lucide-svelte/icons/calendar-fold";
  import OnlineMeetingIcon from "lucide-svelte/icons/video";
  import TodayIcon from "lucide-svelte/icons/calendar-check";
  import NextDaysIcon from "lucide-svelte/icons/calendar-clock";
  import GoToDateIcon from "lucide-svelte/icons/calendar-search";
  import OverlayIcon from "lucide-svelte/icons/layers";
  import OpenCalendarIcon from "lucide-svelte/icons/folder-open";
  import PropertiesIcon from "lucide-svelte/icons/file-cog";
  import ShareIcon from "lucide-svelte/icons/share-2";
  import PermissionsIcon from "lucide-svelte/icons/user-lock";
  import AddressBookIcon from "lucide-svelte/icons/book-user";
  import RenameIcon from "lucide-svelte/icons/pencil-line";
  import ColorIcon from "lucide-svelte/icons/palette";
  import SyncIcon from "lucide-svelte/icons/refresh-cw";
  import SyncAllIcon from "lucide-svelte/icons/refresh-ccw-dot";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import TimeScaleIcon from "lucide-svelte/icons/ruler";
  import FolderPaneIcon from "lucide-svelte/icons/panel-left";
  import ReadingPaneIcon from "lucide-svelte/icons/panel-right";
  import { ReadingPanePosition } from "../Mail/MailView";
  import ViewSettingsIcon from "lucide-svelte/icons/sliders-horizontal";
  import { t } from "../../l10n/l10n";

  export let view: CalendarViewType;
  export let currentView: CalendarCurrentView;
  export let onCurrentView: (view: CalendarCurrentView) => void;
  export let onResetView: () => void;
  export let splitView: boolean;
  export let timeScale: number;
  export let onView: (view: CalendarViewType) => void;
  export let onToday: () => void;
  export let onNext7Days: () => void;
  export let onGoToDate: () => void;

  $: calendarViews = [
    { id: CalendarCurrentView.Calendar, label: $t`Calendar`, icon: CalendarViewIcon, tooltip: $t`Day, week and month calendar` },
    { id: CalendarCurrentView.Preview, label: $t`Preview`, icon: PreviewViewIcon, tooltip: $t`Calendar with location and notes in the appointments` },
    { id: CalendarCurrentView.List, label: $t`List`, icon: ListViewIcon, tooltip: $t`All appointments and meetings in a table` },
    { id: CalendarCurrentView.Active, label: $t`Active`, icon: ActiveViewIcon, tooltip: $t`Appointments and meetings that are still to come` },
  ];
  const folderPane = CalendarSettings.folderPane;
  const readingPane = CalendarSettings.readingPane;
  const ribbonLayout = getLocalStorage<RibbonLayout>("lookout.ribbon.layout", "classic");
  $: isSimplified = $ribbonLayout.value == "simplified";

  let calendars = appGlobal.calendars;
  $: noCalendar = !$calendars.hasItems && $t`Please set up a calendar first`;
  $: noSelection = !$selectedCalendar && $t`Select a calendar first`;
  $: isTable = currentView == CalendarCurrentView.List || currentView == CalendarCurrentView.Active;
  $: canDelete = CalendarActions.canDeleteCalendar($selectedCalendar);
  $: canShare = CalendarSharing.canShare($selectedCalendar);
  $: overlayDisabled = view == "schedule" && $t`Overlay is available in the Day, Work Week, Week and Month views`;

  function onCalendarOptions() {
    SettingsDialogs.openOptions("calendar");
  }

  async function onDeleteCalendar() {
    await CalendarActions.deleteCalendar($selectedCalendar);
  }

  function onOverlay(overlay: boolean) {
    CalendarSettings.splitView.value = !overlay;
  }

  function onTimeScale(minutes: number) {
    CalendarSettings.timeScale.value = minutes;
  }

  function onFolderPane(mode: CalendarFolderPane) {
    CalendarSettings.folderPane.value = mode;
  }
</script>
