
<HeaderGroupBox>
  <hbox slot="header">IMAP - {$t`Advanced`}</hbox>

  <Checkbox bind:checked={account.loginOnStartup} label={$t`Login on startup`} allowIndetermined={false} />

  <hbox class="interval-box">
    <label for="pollInterval" title={$t`How often to check for new and deleted messages.\n\nNote: If the server supports PUSH mail, new emails will appear immediately independent of this setting.\nTherefore, the interval should be high.`}>
      {$t`Poll interval`}
      <InfoIcon size="14px" class="info" />
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
  .interval-box {
    margin-block-start: 16px;
  }
  input[name="pollInterval"] {
    width: 3em;
    text-align: center;
    margin-inline-start: 12px;
    margin-inline-end: 6px;
  }
  .interval-box label :global(.info) {
    color: rosybrown;
  }
</style>
