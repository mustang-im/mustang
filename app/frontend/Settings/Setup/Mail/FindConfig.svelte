<StatusMessage status="processing"
  message="We are looking for the configuration of your email account..." />

<script lang="ts">
  import { findConfig } from "../../../../logic/Mail/AutoConfig/findConfig";
  import type { MailAccount } from "../../../../logic/Mail/MailAccount";
  import StatusMessage from "../Shared/StatusMessage.svelte";
  import { assert } from "../../../../logic/util/util";
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

  onMount(async () => {
    try {
      altConfigs = await findConfig(emailAddress, password, abort);
      assert(altConfigs?.length, `We could not find a configuration for ${emailAddress}`);
      config = altConfigs.slice().shift();
      dispatchEvent("continue");
    } catch (ex) {
      dispatchEvent("fail", ex);
    }
  });
</script>
