<Ribbon>
  <RibbonTab label={$t`Home`}>
    <RibbonGroup label={$t`New`}>
      <RibbonButton label={$t`New Appointment`} icon={NewAppointmentIcon} shortCutInfo="Ctrl+N"
        onClick={() => CalendarActions.newEventAtSelection(null)}
        disabled={!$calendars.hasItems && $t`Please set up a calendar first`} />
      <RibbonButton label={$t`New Meeting`} icon={NewMeetingIcon} shortCutInfo="Ctrl+Shift+Q"
        onClick={() => CalendarActions.newEventAtSelection(null, "meeting")}
        disabled={!$calendars.hasItems && $t`Please set up a calendar first`} />
      <RibbonMenuButton label={$t`New Items`} icon={NewItemsIcon}
        disabled={!$calendars.hasItems && $t`Please set up a calendar first`}>
        <MenuItem label={$t`Appointment`} icon={NewAppointmentIcon}
          onClick={() => CalendarActions.newEventAtSelection(null)} />
        <MenuItem label={$t`Meeting`} icon={NewMeetingIcon}
          onClick={() => CalendarActions.newEventAtSelection(null, "meeting")} />
        <MenuItem label={$t`All Day Event`} icon={AllDayIcon}
          onClick={() => CalendarActions.newEventAtSelection(null, "all-day")} />
        <MenuItem label={$t`Recurring Appointment`} icon={RecurringIcon}
          onClick={() => CalendarActions.newEventAtSelection(null, "recurring")} />
      </RibbonMenuButton>
    </RibbonGroup>
    <RibbonGroup label={$t`Go To`}>
      <RibbonButton label={$t`Today`} icon={TodayIcon} onClick={onToday} />
      <RibbonButton label={$t`Next 7 Days`} icon={NextDaysIcon} onClick={onNext7Days} />
      <RibbonButton label={$t`Go To Date`} icon={GoToDateIcon} shortCutInfo="Ctrl+G" onClick={onGoToDate} />
    </RibbonGroup>
    <RibbonGroup label={$t`Arrange`}>
      <RibbonToggleButton label={$t`Day`} icon={DayIcon} shortCutInfo="Ctrl+Alt+1"
        bind:checked={isDay} onChange={() => selectView("day")} />
      <RibbonToggleButton label={$t`Work Week`} icon={WorkWeekIcon} shortCutInfo="Ctrl+Alt+2"
        bind:checked={isWorkWeek} onChange={() => selectView("workweek")} />
      <RibbonToggleButton label={$t`Week`} icon={WeekIcon} shortCutInfo="Ctrl+Alt+3"
        bind:checked={isWeek} onChange={() => selectView("week")} />
      <RibbonToggleButton label={$t`Month`} icon={MonthIcon} shortCutInfo="Ctrl+Alt+4"
        bind:checked={isMonth} onChange={() => selectView("month")} />
      <RibbonToggleButton label={$t`Split View`} icon={SplitViewIcon}
        tooltip={$t`Show the calendars side by side`}
        bind:checked={splitView}
        disabled={view == "month" && $t`Split view is available in the Day, Work Week and Week views`}
        onChange={onSplitView} />
    </RibbonGroup>
    <RibbonGroup label={$t`Manage Calendars`}>
      <RibbonMenuButton label={$t`Add Calendar`} icon={AddCalendarIcon}>
        <MenuItem label={$t`New Calendar Account…`} icon={AddCalendarIcon}
          onClick={() => CalendarActions.addCalendarAccount()} />
        {#if sharingAccounts.length == 1}
          <MenuItem label={$t`Open Shared Calendar…`} icon={SharedCalendarIcon}
            onClick={() => CalendarActions.openSharedCalendar(sharingAccounts[0])} />
        {:else if sharingAccounts.length > 1}
          <MenuLabel label={$t`Open Shared Calendar`} />
          {#each sharingAccounts as account (account.id)}
            <MenuItem label={account.name} icon={SharedCalendarIcon}
              onClick={() => CalendarActions.openSharedCalendar(account)} />
          {/each}
        {/if}
      </RibbonMenuButton>
      <RibbonButton label={$t`Calendar Properties`} icon={PropertiesIcon}
        onClick={() => CalendarActions.openProperties($selectedCalendar)}
        disabled={!$selectedCalendar && $t`Select a calendar first`} />
    </RibbonGroup>
    <RibbonGroup label={$t`Share`}>
      <RibbonButton label={$t`Share Calendar`} icon={ShareIcon}
        onClick={() => CalendarActions.openSharing($selectedCalendar)}
        disabled={!CalendarActions.canShare($selectedCalendar) && $t`This calendar cannot be shared`} />
    </RibbonGroup>
  </RibbonTab>
  <RibbonTab label={$t`Send / Receive`}>
    <RibbonGroup label={$t`Send & Receive`}>
      <RibbonButton label={$t`Update Folder`} icon={SyncIcon}
        tooltip={$t`Get the latest events of the selected calendar`}
        onClick={() => CalendarActions.update([ $selectedCalendar ])}
        disabled={!$selectedCalendar && $t`Select a calendar first`} />
      <RibbonButton label={$t`Update All`} icon={SyncAllIcon}
        tooltip={$t`Get the latest events of all calendars`}
        onClick={() => CalendarActions.update($calendars.contents)}
        disabled={!$calendars.hasItems && $t`Please set up a calendar first`} />
    </RibbonGroup>
  </RibbonTab>
  <RibbonTab label={$t`Folder`}>
    <RibbonGroup label={$t`Actions`}>
      <RibbonButton label={$t`Import / Export`} icon={ImportIcon}
        onClick={() => CalendarActions.openImportExport($selectedCalendar)}
        disabled={!$selectedCalendar && $t`Select a calendar first`} />
      <RibbonButton label={$t`Delete Calendar`} icon={DeleteIcon}
        tooltip={$t`Remove the shared calendar from this app`}
        onClick={() => CalendarActions.deleteSharedCalendar($selectedCalendar)}
        disabled={!isSharedCalendar && $t`Only shared calendars can be removed here`} />
    </RibbonGroup>
    <RibbonGroup label={$t`Properties`}>
      <RibbonButton label={$t`Calendar Permissions`} icon={ShareIcon}
        onClick={() => CalendarActions.openSharing($selectedCalendar)}
        disabled={!CalendarActions.canShare($selectedCalendar) && $t`This calendar cannot be shared`} />
      <RibbonButton label={$t`Calendar Properties`} icon={PropertiesIcon}
        onClick={() => CalendarActions.openProperties($selectedCalendar)}
        disabled={!$selectedCalendar && $t`Select a calendar first`} />
    </RibbonGroup>
  </RibbonTab>
  <RibbonTab label={$t`View`}>
    <RibbonGroup label={$t`Arrangement`}>
      <RibbonToggleButton label={$t`Day`} icon={DayIcon} shortCutInfo="Ctrl+Alt+1"
        bind:checked={isDay} onChange={() => selectView("day")} />
      <RibbonToggleButton label={$t`Work Week`} icon={WorkWeekIcon} shortCutInfo="Ctrl+Alt+2"
        bind:checked={isWorkWeek} onChange={() => selectView("workweek")} />
      <RibbonToggleButton label={$t`Week`} icon={WeekIcon} shortCutInfo="Ctrl+Alt+3"
        bind:checked={isWeek} onChange={() => selectView("week")} />
      <RibbonToggleButton label={$t`Month`} icon={MonthIcon} shortCutInfo="Ctrl+Alt+4"
        bind:checked={isMonth} onChange={() => selectView("month")} />
      <RibbonToggleButton label={$t`Split View`} icon={SplitViewIcon}
        tooltip={$t`Show the calendars side by side`}
        bind:checked={splitView}
        disabled={view == "month" && $t`Split view is available in the Day, Work Week and Week views`}
        onChange={onSplitView} />
      <RibbonMenuButton label={$t`Time Scale`} icon={TimeScaleIcon}
        disabled={view == "month" && $t`The time scale applies to the Day, Work Week and Week views`}>
        {#each timeScales as scale}
          <MenuItem label={timeScaleLabel(scale)} icon={scale == timeScale ? CheckIcon : BlankIcon}
            onClick={() => onTimeScale(scale)} />
        {/each}
      </RibbonMenuButton>
    </RibbonGroup>
    <RibbonGroup label={$t`Layout`}>
      <RibbonToggleButton label={$t`Folder Pane`} icon={FolderPaneIcon}
        bind:checked={showFolderPane} onChange={onFolderPane} />
      <RibbonToggleButton label={$t`Week Numbers`} icon={WeekNumbersIcon}
        tooltip={$t`Show week numbers in the month view and in the date navigator`}
        bind:checked={showWeekNumbers} onChange={onWeekNumbers} />
      <RibbonToggleButton label={$t`Declined Events`} icon={DeclinedIcon}
        tooltip={$t`Show events that you declined`}
        bind:checked={showDeclined} onChange={onShowDeclined} />
    </RibbonGroup>
  </RibbonTab>
</Ribbon>

<script lang="ts">
  import { CalendarActions } from "./CalendarActions";
  import { CalendarSettings, type CalendarViewType } from "./CalendarSettings";
  import { CalendarGroups } from "./FolderPane/CalendarGroups";
  import { selectedCalendar } from "../../frontend/Calendar/selected";
  import { appGlobal } from "../../logic/app";
  import Ribbon from "../Shared/Ribbon/Ribbon.svelte";
  import RibbonTab from "../Shared/Ribbon/RibbonTab.svelte";
  import RibbonGroup from "../Shared/Ribbon/RibbonGroup.svelte";
  import RibbonButton from "../Shared/Ribbon/RibbonButton.svelte";
  import RibbonToggleButton from "../Shared/Ribbon/RibbonToggleButton.svelte";
  import RibbonMenuButton from "../Shared/Ribbon/RibbonMenuButton.svelte";
  import MenuItem from "../../frontend/Shared/Menu/MenuItem.svelte";
  import MenuLabel from "../../frontend/Shared/Menu/MenuLabel.svelte";
  import NewAppointmentIcon from "lucide-svelte/icons/calendar-plus";
  import NewMeetingIcon from "lucide-svelte/icons/users-round";
  import NewItemsIcon from "lucide-svelte/icons/calendar-plus-2";
  import AllDayIcon from "lucide-svelte/icons/sun";
  import RecurringIcon from "lucide-svelte/icons/repeat";
  import TodayIcon from "lucide-svelte/icons/calendar-check";
  import NextDaysIcon from "lucide-svelte/icons/calendar-clock";
  import GoToDateIcon from "lucide-svelte/icons/calendar-search";
  import DayIcon from "lucide-svelte/icons/calendar-1";
  import WorkWeekIcon from "lucide-svelte/icons/columns-4";
  import WeekIcon from "lucide-svelte/icons/calendar-range";
  import MonthIcon from "lucide-svelte/icons/calendar-days";
  import SplitViewIcon from "lucide-svelte/icons/columns-2";
  import AddCalendarIcon from "lucide-svelte/icons/calendar-plus";
  import SharedCalendarIcon from "lucide-svelte/icons/users-round";
  import PropertiesIcon from "lucide-svelte/icons/settings-2";
  import ShareIcon from "lucide-svelte/icons/share-2";
  import SyncIcon from "lucide-svelte/icons/refresh-cw";
  import SyncAllIcon from "lucide-svelte/icons/refresh-ccw-dot";
  import ImportIcon from "lucide-svelte/icons/import";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import TimeScaleIcon from "lucide-svelte/icons/ruler";
  import FolderPaneIcon from "lucide-svelte/icons/panel-left";
  import WeekNumbersIcon from "lucide-svelte/icons/hash";
  import DeclinedIcon from "lucide-svelte/icons/calendar-x-2";
  import CheckIcon from "lucide-svelte/icons/circle-dot";
  import BlankIcon from "lucide-svelte/icons/circle";
  import { t } from "../../l10n/l10n";

  export let view: CalendarViewType;
  export let splitView: boolean;
  export let timeScale: number;
  export let showFolderPane: boolean;
  export let showWeekNumbers: boolean;
  export let showDeclined: boolean;
  export let onView: (view: CalendarViewType) => void;
  export let onToday: () => void;
  export let onNext7Days: () => void;
  export let onGoToDate: () => void;

  const timeScales = [60, 30, 15, 10, 6, 5];

  let calendars = appGlobal.calendars;
  let sharingAccounts = CalendarActions.accountsWithSharedCalendars();
  let isDay = false;
  let isWorkWeek = false;
  let isWeek = false;
  let isMonth = false;
  $: setViewToggles(view);
  function setViewToggles(view: CalendarViewType) {
    isDay = view == "day";
    isWorkWeek = view == "workweek";
    isWeek = view == "week";
    isMonth = view == "month";
  }

  let emailAccounts = appGlobal.emailAccounts;
  $: $emailAccounts, sharingAccounts = CalendarActions.accountsWithSharedCalendars();
  $: isSharedCalendar = !!$selectedCalendar && CalendarGroups.isShared($selectedCalendar);

  function selectView(newView: CalendarViewType) {
    onView(newView);
    setViewToggles(newView);
  }

  function timeScaleLabel(minutes: number): string {
    if (minutes == 60) {
      return $t`60 minutes - Least space for details`;
    }
    if (minutes == 5) {
      return $t`5 minutes - Most space for details`;
    }
    return $t`${minutes} minutes`;
  }

  function onSplitView(checked: boolean) {
    CalendarSettings.splitView.value = checked;
  }

  function onTimeScale(minutes: number) {
    timeScale = minutes;
    CalendarSettings.timeScale.value = minutes;
  }

  function onFolderPane(checked: boolean) {
    CalendarSettings.folderPane.value = checked;
  }

  function onWeekNumbers(checked: boolean) {
    CalendarSettings.weekNumbers.value = checked;
  }

  function onShowDeclined(checked: boolean) {
    CalendarSettings.showDeclined.value = checked;
  }
</script>
