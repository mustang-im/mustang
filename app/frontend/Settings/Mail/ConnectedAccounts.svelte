<vbox class="connected-accounts">
  <HeaderGroupBox>
    <hbox slot="header">{$t`Connected accounts`}</hbox>
    <vbox class="content">
      <grid>
        <label for="name">{$t`Add invitations to calendar`}</label>
        <select bind:value={account.calendar} name="calendar"
          disabled={$calendars.length <= 1}>
          {#each $calendars as calendar}
            <option value={calendar}>{calendar.name}</option>
          {/each}
        </select>
      </grid>
    </vbox>
  </HeaderGroupBox>
</vbox>

<script lang="ts">
  import { MailAccount } from "../../../logic/Mail/MailAccount";
  import HeaderGroupBox from "../../Shared/HeaderGroupBox.svelte";
  import { t } from "../../../l10n/l10n";

  export let account: MailAccount;

  $: calendars = account.calendarsAvailable;
</script>

<style>
  grid {
    grid-template-columns: max-content auto;
    gap: 8px 24px;
  }
</style>
