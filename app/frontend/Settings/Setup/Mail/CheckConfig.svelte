<StatusMessage status="processing"
  message="Verifying that the configuration works..." />

<script lang="ts">
  import type { MailAccount } from "../../../../logic/Mail/MailAccount";
  import { checkConfig } from "../../../../logic/Mail/AutoConfig/checkConfig";
  import StatusMessage from "../Shared/StatusMessage.svelte";
  import { createEventDispatcher, onMount } from 'svelte';
  const dispatchEvent = createEventDispatcher();

  /** in */
  export let config: MailAccount;
  export let emailAddress: string;
  export let password: string;
  /** in */
  export let abort: AbortController;

  onMount(async () => {
    try {
      await checkConfig(config, emailAddress, password);
      dispatchEvent("continue");
    } catch (ex) {
      dispatchEvent("fail", ex);
    }
  });
</script>

<style>
</style>
