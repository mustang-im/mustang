<StatusMessage status="processing"
  message="We are looking for the configuration of your email account..." />

<script lang="ts">
  import { findConfig } from "../../../logic/Mail/AutoConfig/findConfig";
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import StatusMessage from "./StatusMessage.svelte";
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

  onMount(async () => {
    try {
      altConfigs = await findConfig(emailAddress, password);
      config = altConfigs.slice().shift();
      dispatchEvent("continue");
    } catch (ex) {
      dispatchEvent("fail", ex);
    }
  });
</script>

<style>
</style>
