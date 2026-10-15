<vbox flex>
  {#if appGlobal.emailAccounts.isEmpty}
    <SetupMail />
  {:else}
    {#await checkLicense()}
      <div class="message">{$t`Checking...`}</div>
    {:then}
      {#if $license.isSoonExpiring}
        <div>{$t`Your license expires in ${$license.daysLeft} days, on ${getDateString($license.expiresOn)}`}</div>
      {:else if $license.isExpired}
        <div>{$t`Your license has expired on ${getDateString($license.expiresOn)}`}</div>
      {:else if $license.valid}
        <HaveLicense />
      {:else}
        <div>{$t`You can buy a license to use ${appName} fully`}</div>
      {/if}

      {#if !$license.valid || $license.isSoonExpiring}
        <vbox class="payment-page" flex>
          <hbox class="buttons">
            <Button
              label={$t`Open in browser`}
              onClick={() => license.openPurchasePage()}
              classes="tertiary"
              />
          </hbox>

          <PaymentPage />
        </vbox>
      {/if}
    {:catch ex}
      <div class="error-intro message">{$t`Failed to contact the license server`}</div>
      <ErrorMessageInline {ex} />
    {/await}
  {/if}
</vbox>

<script lang="ts">
  import { license } from "../../../../logic/util/LicenseClient";
  import { appGlobal } from "../../../../logic/app";
  import { appName } from "../../../../logic/build";
  import HaveLicense from "./HaveLicense.svelte";
  import PaymentPage from "./PaymentPage.svelte";
  import SetupMail from "../../../Setup/Mail/SetupMail.svelte";
  import ErrorMessageInline from "../../../Shared/ErrorMessageInline.svelte";
  import Button from "../../../Shared/Button.svelte";
  import { getDateString } from "../../../Util/date";
  import { t } from "../../../../l10n/l10n";
  import { onDestroy } from "svelte";

  async function checkLicense() {
    await license.fetchTicket();
    if (!license.valid || license.isSoonExpiring) {
      license.waitForPayment();
    }
  }

  onDestroy(() => license.stopWaitingForPayment());
</script>

<style>
  .error-intro {
    margin: 4px 20px;
  }
  .payment-page .buttons {
    justify-content: end;
    margin-block-start: -24px;
    margin-block-end: 12px;
  }
</style>
