<vbox>
  <h2>{$t`Manual configuration`}</h2>
  <hbox class="subtitle">{$t`Your email provider or company can tell you these details.`}</hbox>

  <ManualConfig {config} bind:stepFull bind:incomingEl bind:outgoingEl />
</vbox>

<script lang="ts">
  import type { MailAccount } from "../../../../../logic/Mail/MailAccount";
  import ManualConfig from "./ManualConfig.svelte";
  import type ManualConfigServer from "./ManualConfigServer.svelte";
  import { t } from "../../../../../l10n/l10n";

  /** in */
  export let config: MailAccount;
  export let abort: AbortController = new AbortController();
  /** in/out */
  export let stepFull = false;

  let incomingEl: ManualConfigServer;
  let outgoingEl: ManualConfigServer;

  /** User just pressed the [Next] button */
  export async function onContinue(): Promise<boolean> {
    return await incomingEl.onContinue() &&
      await outgoingEl.onContinue();
  }
</script>

<style>
  h2 {
    margin-block-end: 0px;
  }
</style>
