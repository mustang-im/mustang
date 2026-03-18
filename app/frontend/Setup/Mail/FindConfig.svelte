{#if fetchingIcon}
  <StatusMessage status="processing"
    message={$t`Fetching icon...`} />
{:else}
  <StatusMessage status="processing"
    message={$t`We are looking for the configuration of your email account...`} />
{/if}

<script lang="ts">
  import { findConfig } from "../../../logic/Mail/AutoConfig/findConfig";
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import { getFavIcon } from "../Shared/favicon";
  import { getDomainForEmailAddress } from "../../../logic/util/netUtil";
  import { appGlobal } from "../../../logic/app";
  import StatusMessage from "../Shared/StatusMessage.svelte";
  import { t } from "../../../l10n/l10n";
  import { assert } from "../../../logic/util/util";
  import type { ArrayColl } from "svelte-collections";
  import { createEventDispatcher, onMount } from 'svelte';
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

  let fetchingIcon = false;

  onMount(async () => {
    try {
      altConfigs = await findConfig(emailAddress, password, exchangeConfirmCallback, abort);
      // Mobile does not support OWA yet, see mobile/backend/backend.ts OWA.*
      if (/* appGlobal.isMobile && */ false && altConfigs.find(acc => acc.protocol == "owa")) {
        altConfigs.removeAll(altConfigs.contents.filter(acc => acc.protocol == "owa"));
      }
      let domain = getDomainForEmailAddress(emailAddress);
      assert(altConfigs?.length, $t`We could not find a configuration for ${domain}`);
      config = altConfigs.slice().shift();
      fetchingIcon = true;
      config.icon = await getFavIcon(domain);
      fetchingIcon = false;
      dispatchEvent("continue");
    } catch (ex) {
      fetchingIcon = false;
      dispatchEvent("fail", ex);
    }
  });

  async function exchangeConfirmCallback(emailAddress: string, redirectDomain: string): Promise<boolean> {
    return confirm($t`A configuration for your account ${emailAddress} may be available at:\n\n${redirectDomain}\n\nDo you want to submit your password there?`);
  }
</script>
