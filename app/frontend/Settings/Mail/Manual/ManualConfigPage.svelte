<vbox>
  <h2>{$t`Manual configuration`}</h2>
  <hbox class="subtitle">{$t`Your email provider or company can tell you these details.`}</hbox>

  <ManualConfig bind:config bind:stepFull bind:this={el} isSetup={true} />
</vbox>

<script lang="ts">
  import type { MailAccount } from "../../../../logic/Mail/MailAccount";
  import ManualConfig from "./ManualConfig.svelte";
  import { t } from "../../../../l10n/l10n";

  /** in/out */
  export let config: MailAccount;
  export let abort: AbortController = new AbortController();
  /** in/out */
  export let stepFull = false;

  let el: ManualConfig;
  export async function onContinue(): Promise<boolean> {
    return await el.onContinue();
  }
</script>

<style>
  h2 {
    margin-block-end: 0px;
  }
</style>
