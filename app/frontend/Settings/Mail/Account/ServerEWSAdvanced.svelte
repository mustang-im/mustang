<HeaderGroupBox>
  <hbox slot="header">Exchange - {$t`Advanced`}</hbox>

  <Checkbox bind:checked={account.useChromiumNTLM} allowIndetermined={false}
    label={$t`Use the browser HTTP and NTLM implementation`}
    tooltip={$t`Use the Chromium network stack to perform the NTLM login and HTTP requests. Try this if the login to your Exchange server is unreliable, or you want to use the Windows SSO.`} />
</HeaderGroupBox>

<script lang="ts">
  import type { EWSAccount } from "../../../../logic/Mail/EWS/EWSAccount";
  import HeaderGroupBox from "../../../Shared/HeaderGroupBox.svelte";
  import Checkbox from "../../../Shared/Checkbox.svelte";
  import { t } from "../../../../l10n/l10n";

  export let account: EWSAccount;
</script>
