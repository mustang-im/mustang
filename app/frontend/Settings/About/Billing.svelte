<vbox>
  {#if error}
    {error?.message ?? error}
  {:else if license.valid}
    <div>{$t`Your license is valid until ${getDateString(license.expiresOn)}`}</div>
    <hbox class="thankyou">
      <div>{$t`Thank you for your purchase.`}</div>
      <HeartIcon />
    </hbox>
  {:else if license.expiredIn < 0}
    <div>{$t`Your license has expired on ${getDateString(license.expiresOn)}`}</div>
  {/if}
  {#if !license.valid}
    <div>{$t`You can buy a license for ${appName} at our website:`}</div>
    <hbox class="buttons">
      <Button
        label={$t`Buy`}
        onClick={onBuy}
        />
    </hbox>
  {/if}
</vbox>

<script lang="ts">
  import { checkLicense, Ticket, BadTicket } from "../../../logic/util/LicenseClient";
  import { getDateString } from "../../Util/date";
  import { appName, siteRoot } from "../../../logic/build";
  import { appGlobal } from "../../../logic/app";
  import Button from "../../Shared/Button.svelte";
  import HeartIcon from "lucide-svelte/icons/heart";
  import { onMount, onDestroy } from "svelte";
  import { t } from "../../../l10n/l10n";

  let license: Ticket = new BadTicket();
  let error: Error;

  onMount(async () => {
    await getLicense();
  });
  onDestroy(stopPolling);

  async function getLicense() {
    try {
      license = await checkLicense();
      error = null;
      console.log("License ticket", license);
    } catch (ex) {
      license = new BadTicket();
      error = ex;
    }
  }

  function onBuy() {
    let realname = appGlobal.emailAccounts.first?.realname ?? "";
    let emailAddress = appGlobal.emailAccounts.first?.identities?.first.emailAddress ?? "";
    let e = encodeURIComponent;
    let url =`${siteRoot}/?name=${e(realname)}&email=${e(emailAddress)}#purchase`;
    console.log("Opening in browser", url);
    appGlobal.remoteApp.openExternalURL(url);
    startPolling();
  }

  let poller: NodeJS.Timeout | null = null;
  function startPolling() {
    poller = setInterval(getLicense, 10 * 1000); // every 10 seconds
    setTimeout(stopPolling, 30 * 60 * 1000); // for 30 minutes
  }
  function stopPolling() {
    if (poller) {
      clearInterval(poller);
    }
    poller = null;
  }
</script>

<style>
  .thankyou {
    margin-block-start: 2px;
  }
  .thankyou :global(svg) {
    fill: red;
    stroke: #FF000033;
    margin-inline-start: 8px;
  }
  .buttons {
    margin-block-start: 8px;
  }
</style>
