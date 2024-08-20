
<HeaderGroupBox>
  <hbox slot="header">{$t`IMAP`} - {$t`Advanced`}</hbox>

  <Checkbox bind:checked={account.loginOnStartup} label={$t`Login on startup`}/>

  <hbox>
    <label for="pollInterval" title={$t`How often to check for new and deleted messages.\nNote: If the server supports PUSH mail, new emails will appear immediately independent of this setting. Therefore, the interval should be high.`}>
      {$t`Poll interval`}
      <InfoIcon size="14px" />
    </label>
    <input type="number" bind:value={account.pollIntervalMinutes} name="pollInterval" min={0} max={360} maxlength={3} />
    <hbox class="unit">{$t`Minutes`}</hbox>
  </hbox>
</HeaderGroupBox>


<script lang="ts">
  import type { IMAPAccount } from "../../../../logic/Mail/IMAP/IMAPAccount";
  import HeaderGroupBox from "../../../Shared/HeaderGroupBox.svelte";
  import Checkbox from "../../../Shared/Checkbox.svelte";
  import InfoIcon from "lucide-svelte/icons/info";
  import { t } from "../../../../l10n/l10n";

  export let account: IMAPAccount;
</script>

<style>
  input[name="pollInterval"] {
    width: 3em;
    text-align: right;
    margin-inline-start: 12px;
    margin-inline-end: 6px;
  }
</style>
