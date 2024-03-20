<hbox flex class="checking">
  <Spinner size="24px" />
  <hbox flex class="message">
    We are looking for the configuration of your email account...
  </hbox>
</hbox>

<script lang="ts">
  import { TLSSocketType, type MailAccount } from "../../../logic/Mail/MailAccount";
  import { IMAPAccount } from "../../../logic/Mail/IMAP/IMAPAccount";
  import Spinner from "./Spinner.svelte";
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
      await sleep(3);
      let domain = emailAddress.split("@")[1];
      if (!domain.includes(".")) {
        throw new Error("Need dot in the domain");
      }
      config = new IMAPAccount();
      config.hostname = "imap." + domain;
      config.port = 993;
      config.tls = TLSSocketType.TLS;
      config.username = emailAddress;
      config.password = password;
      altConfigs = new ArrayColl<MailAccount>();
      altConfigs.add(config);
      console.log("find config", config);
      dispatchEvent("continue");
      // dispatchEvent("fail");
    } catch (ex) {
      dispatchEvent("fail", ex);
    }
  });
</script>

<style>
  .message {
    margin-left: 8px;
    margin-right: 24px;
    padding: 4px 24px;
    border-radius: 16px;
  }
  .checking .message {
    margin-left: 16px;
    background-color: #F0F9F8;
    color: #455468;
  }
</style>
