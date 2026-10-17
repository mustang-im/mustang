<OptionsSection title={$t`Connected accounts`}>
  <OptionsRow icon={ConnectedIcon}>
    <grid class="fields">
      <span>{$t`Send invitations from:`}</span>
      <ComboBox options={$identities.contents.map(identity => ({ value: identity, label: identity.name }))}
        value={$account.inviteAs} label={$t`Send invitations from`} width="320px"
        disabled={$identities.length <= 1}
        onChange={identity => { account.inviteAs = identity; }} />
      <span>{$t`Online meeting:`}</span>
      <ComboBox options={$meetAccounts.contents.map(meetAccount => ({ value: meetAccount, label: meetAccount.name }))}
        value={$account.meetAccount} label={$t`Online meeting`} width="320px"
        disabled={$meetAccounts.length <= 1}
        onChange={meetAccount => { account.meetAccount = meetAccount; }} />
    </grid>
  </OptionsRow>
</OptionsSection>

<script lang="ts">
  import type { Calendar } from "../../../logic/Calendar/Calendar";
  import OptionsSection from "../Shared/OptionsSection.svelte";
  import OptionsRow from "../Shared/OptionsRow.svelte";
  import ComboBox from "../../Shared/Form/ComboBox.svelte";
  import ConnectedIcon from "lucide-svelte/icons/link";
  import { t } from "../../../l10n/l10n";

  export let account: Calendar;

  $: identities = account.identitiesAvailable;
  $: meetAccounts = account.meetAccountsAvailable;
</script>

<style>
  .fields {
    grid-template-columns: 184px max-content;
    align-items: center;
    gap: 6px 10px;
  }
</style>
