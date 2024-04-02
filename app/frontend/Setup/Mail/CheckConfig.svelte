<StatusMessage status="processing"
  message="Verifying that the configuration works..." />

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import StatusMessage from "./StatusMessage.svelte";
  import { makeAbortable } from "../../../logic/util/Abortable";
  import { sleep } from "../../../logic/util/util";
  import { createEventDispatcher, onMount } from 'svelte';
  const dispatchEvent = createEventDispatcher();

  /** in */
  export let config: MailAccount;
  /** in */
  export let abort: AbortController;

  onMount(async () => {
    try {
      await makeAbortable(sleep(3), abort);
      dispatchEvent("continue");
    } catch (ex) {
      dispatchEvent("fail", ex);
    }
  });
</script>

<style>
</style>
