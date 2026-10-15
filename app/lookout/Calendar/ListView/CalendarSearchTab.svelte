<RibbonTab label={$t`Search`}>
  <RibbonGroup label={$t`Scope`}>
    <RibbonToggleButton label={$t`Current Folder`} icon={CurrentFolderIcon} isRadio
      checked={$options.scope == CalendarSearchScope.CurrentFolder}
      disabled={!hasSelectedCalendar && $t`Select a calendar first`}
      tooltip={$t`Search only the selected calendar`}
      onChange={() => CalendarSearch.update({ scope: CalendarSearchScope.CurrentFolder })} />
    <RibbonToggleButton label={$t`All Calendar Items`} icon={AllCalendarsIcon} isRadio
      checked={$options.scope == CalendarSearchScope.AllCalendarItems}
      tooltip={$t`Search all calendars`}
      onChange={() => CalendarSearch.update({ scope: CalendarSearchScope.AllCalendarItems })} />
  </RibbonGroup>
  <RibbonGroup label={$t`Refine`}>
    <RibbonMenuButton label={organizerLabel} icon={OrganizerIcon}
      disabled={!organizers.length && !$options.organizerEMail && $t`None of the found items has an organizer`}>
      <MenuItem label={$t`Any Organizer`} icon={AnyOrganizerIcon} selected={!$options.organizerEMail}
        onClick={() => CalendarSearch.update({ organizerEMail: null })} />
      <MenuDivider />
      {#each organizers as organizer (organizer.emailAddress)}
        <MenuItem label={organizer.name || organizer.emailAddress} tooltip={organizer.emailAddress}
          icon={OrganizerIcon} selected={$options.organizerEMail == organizer.emailAddress}
          onClick={() => CalendarSearch.update({ organizerEMail: organizer.emailAddress })} />
      {/each}
    </RibbonMenuButton>
    <RibbonToggleButton label={$t`Has Attachments`} icon={AttachmentIcon}
      checked={$options.hasAttachments}
      onChange={checked => CalendarSearch.update({ hasAttachments: checked })} />
    <RibbonToggleButton label={$t`Recurring`} icon={RecurringIcon}
      checked={$options.isRecurring}
      onChange={checked => CalendarSearch.update({ isRecurring: checked })} />
  </RibbonGroup>
  <RibbonGroup label={$t`Close`}>
    <RibbonButton label={$t`Close Search`} icon={CloseIcon} shortCutInfo="Esc"
      onClick={() => CalendarSearch.close()} />
  </RibbonGroup>
</RibbonTab>

<script lang="ts">
  import type { PersonUID } from "../../../logic/Abstract/PersonUID";
  import { CalendarSearch, CalendarSearchScope } from "./CalendarSearch";
  import RibbonTab from "../../Shared/Ribbon/RibbonTab.svelte";
  import RibbonGroup from "../../Shared/Ribbon/RibbonGroup.svelte";
  import RibbonButton from "../../Shared/Ribbon/RibbonButton.svelte";
  import RibbonToggleButton from "../../Shared/Ribbon/RibbonToggleButton.svelte";
  import RibbonMenuButton from "../../Shared/Ribbon/RibbonMenuButton.svelte";
  import MenuItem from "../../../frontend/Shared/Menu/MenuItem.svelte";
  import MenuDivider from "../../../frontend/Shared/Menu/MenuDivider.svelte";
  import CurrentFolderIcon from "lucide-svelte/icons/calendar";
  import AllCalendarsIcon from "lucide-svelte/icons/calendars";
  import OrganizerIcon from "lucide-svelte/icons/user-round";
  import AnyOrganizerIcon from "lucide-svelte/icons/users-round";
  import AttachmentIcon from "lucide-svelte/icons/paperclip";
  import RecurringIcon from "lucide-svelte/icons/repeat";
  import CloseIcon from "lucide-svelte/icons/x";
  import { t } from "../../../l10n/l10n";

  export let organizers: PersonUID[];
  export let hasSelectedCalendar: boolean;

  const options = CalendarSearch.options;

  $: chosenOrganizer = organizers.find(organizer => organizer.emailAddress == $options.organizerEMail);
  $: organizerLabel = $options.organizerEMail
    ? chosenOrganizer?.name || $options.organizerEMail
    : $t`Organizer`;
</script>
