<vbox class="connected-accounts">
  <HeaderGroupBox>
    <hbox slot="header">{$t`Connected accounts`}</hbox>
    <vbox class="content">
      <grid>
        <label for="name">{$t`Add invitations to calendar`}</label>
        <AccountDropDown accounts={calendars}
          bind:selectedAccount={account.calendar}
          filterByWorkspace={false}
          icon={CalendarIcon}
          iconSize="16px"
          disabled={$calendars.length <= 1} />
      </grid>
    </vbox>
  </HeaderGroupBox>
</vbox>

<script lang="ts">
  import { MailAccount } from "../../../logic/Mail/MailAccount";
  import HeaderGroupBox from "../../Shared/HeaderGroupBox.svelte";
  import AccountDropDown from "../../Shared/AccountDropDown.svelte";
  import CalendarIcon from "lucide-svelte/icons/calendar";
  import { t } from "../../../l10n/l10n";

  export let account: MailAccount;

  let lastAccount = account;
  let calendars = account.calendarsAvailable;
  $: if (account !== lastAccount) {
    lastAccount = account;
    calendars = account.calendarsAvailable;
  }
</script>

<style>
  grid {
    grid-template-columns: max-content auto;
    gap: 8px 24px;
  }
</style>
