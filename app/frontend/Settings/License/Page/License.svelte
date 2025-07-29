<vbox>
  {#await getLicense()}
    <div class="message">{$t`Checking...`}</div>
  {:then}
    {#if license.isSoonExpiring}
      <SoonExpiring bind:license />
    {:else if license.isExpired}
      <Expired bind:license />
    {:else if license.valid && !wasValid}
      <PaidJustNow bind:license />
    {:else if license.valid}
      <HaveLicense bind:license />
    {:else if owlLicense}
      <Upgrade bind:license {owlLicense} />
    {:else}
      <NeverPaid bind:license />
    {/if}
  {:catch ex}
    <div class="error-intro message">{$t`Failed to contact the license server`}</div>
    <ErrorMessageInline {ex} />
  {/await}
</vbox>

<script lang="ts">
  import { checkSavedLicense, Ticket, BadTicket, fetchLicenseFromServer } from "../../../../logic/util/LicenseClient";
  import HaveLicense from "./HaveLicense.svelte";
  import SoonExpiring from "./SoonExpiring.svelte";
  import Expired from "./Expired.svelte";
  import Upgrade from "./Upgrade.svelte";
  import PaidJustNow from "./PaidJustNow.svelte";
  import NeverPaid from "./NeverPaid.svelte";
  import ErrorMessageInline from "../../../Shared/ErrorMessageInline.svelte";
  import { t } from "../../../../l10n/l10n";

  let license: Ticket = new BadTicket();
  let owlLicense: Ticket | null = null;
  let wasValid = false; // to detect that the license was just purchased

  async function getLicense() {
    license = await checkSavedLicense();
    license = await fetchLicenseFromServer();
    wasValid = license.valid;
    console.log("License ticket", license);
  }

  function testLicense() {
    license = new Ticket();
    let exp = new Date();
    exp.setDate(exp.getDate() - 2);
    license.expiresOn = exp;
    license.valid = !license.isExpired;
    console.log("Test license expires in", license.daysLeft, "days, soon", license.isSoonExpiring, "old", license.hasRecentlyExpired, "expired", license.isExpired, "ticket", license);
  }
</script>

<style>
  .error-intro {
    margin: 4px 20px;
  }
</style>
