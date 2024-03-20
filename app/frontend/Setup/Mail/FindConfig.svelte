<StatusMessage status="processing"
  message="We are looking for the configuration of your email account..." />

<script lang="ts">
  import { TLSSocketType, type MailAccount } from "../../../logic/Mail/MailAccount";
  import { IMAPAccount } from "../../../logic/Mail/IMAP/IMAPAccount";
  import StatusMessage from "./StatusMessage.svelte";
  import { sleep } from "../../../logic/util/util";
  import { ArrayColl } from "svelte-collections";
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
      let domain = emailAddress.split("@")[1];
      if (!domain.includes(".")) {
        throw new Error("Need dot in the domain");
      }
      await sleep(3);
      config = new IMAPAccount();
      config.hostname = "imap." + domain;
      config.port = 993;
      config.tls = TLSSocketType.TLS;
      config.username = emailAddress;
      config.password = password;
      altConfigs = new ArrayColl<MailAccount>();
      altConfigs.add(config);
      dispatchEvent("continue");
    } catch (ex) {
      dispatchEvent("fail", ex);
    }
  });
</script>

<style>
</style>
