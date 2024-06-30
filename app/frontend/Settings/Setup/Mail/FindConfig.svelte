<StatusMessage status="processing"
  message={$t`We are looking for the configuration of your email account...`} />

<script lang="ts">
  import { findConfig } from "../../../../logic/Mail/AutoConfig/findConfig";
  import type { MailAccount } from "../../../../logic/Mail/MailAccount";
  import StatusMessage from "../Shared/StatusMessage.svelte";
  import { assert } from "../../../../logic/util/util";
  import type { ArrayColl } from "svelte-collections";
  import { createEventDispatcher, onMount } from 'svelte';
  import { t } from "../../../../l10n/l10n";
  const dispatchEvent = createEventDispatcher();

  /** in */
  export let emailAddress: string;
  /** in */
  export let password: string;
  /** out */
  export let config: MailAccount;
  /** out */
  export let altConfigs: ArrayColl<MailAccount>;
  /** in */
  export let abort: AbortController;

  onMount(async () => {
    try {
      altConfigs = await findConfig(emailAddress, password, exchangeConfirmCallback, abort);
      assert(altConfigs?.length, $t`We could not find a configuration for ${emailAddress}`);
      config = altConfigs.slice().shift();
      dispatchEvent("continue");
    } catch (ex) {
      dispatchEvent("fail", ex);
    }
  });

  async function exchangeConfirmCallback(emailAddress: string, redirectDomain: string): Promise<boolean> {
    return confirm($t`A configuration for your account ${emailAddress} may be available at:\n\n${redirectDomain}\n\nDo you want to submit your password there?`);
  }
</script>
