<MenuItem label={$t`From Address Book…`} icon={AddressBookIcon}
  disabled={!sharingAccounts.length && $t`None of your accounts can open the calendars of colleagues`}
  onClick={() => CalendarActions.openSharedCalendar(null, true)} />
<MenuItem label={$t`Open Shared Calendar…`} icon={SharedCalendarIcon}
  disabled={!sharingAccounts.length && $t`None of your accounts can open the calendars of colleagues`}
  onClick={() => CalendarActions.openSharedCalendar(null)} />
<MenuDivider />
<MenuItem label={$t`New Calendar Account…`} icon={NewAccountIcon}
  onClick={() => CalendarActions.addCalendarAccount()} />

<script lang="ts">
  import { CalendarActions } from "../CalendarActions";
  import { SharedCalendars } from "../Dialogs/SharedCalendars";
  import { appGlobal } from "../../../logic/app";
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";
  import MenuDivider from "../../Shared/Menu/MenuDivider.svelte";
  import AddressBookIcon from "lucide-svelte/icons/book-user";
  import SharedCalendarIcon from "lucide-svelte/icons/users-round";
  import NewAccountIcon from "lucide-svelte/icons/calendar-cog";
  import { t } from "../../../l10n/l10n";

  const emailAccounts = appGlobal.emailAccounts;
  $: $emailAccounts, sharingAccounts = SharedCalendars.accounts();
  let sharingAccounts = SharedCalendars.accounts();
</script>
