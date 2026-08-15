<HeaderGroupBox>
  <hbox slot="header">Exchange - {$t`Advanced`}</hbox>

  <Checkbox bind:checked={account.useOwnNTLM} allowIndetermined={false}
    label={$t`Use own NTLM login implementation`}
    tooltip={$t`Normally, the browser network stack performs the NTLM login. Turn this on to use our own NTLM implementation instead, e.g. if the login to your Exchange server is unreliable.`} />
</HeaderGroupBox>

<script lang="ts">
  import type { EWSAccount } from "../../../../logic/Mail/EWS/EWSAccount";
  import HeaderGroupBox from "../../../Shared/HeaderGroupBox.svelte";
  import Checkbox from "../../../Shared/Checkbox.svelte";
  import { t } from "../../../../l10n/l10n";

  export let account: EWSAccount;
</script>
