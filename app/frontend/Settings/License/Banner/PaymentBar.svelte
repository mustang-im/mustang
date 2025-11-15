{#if account?.needsLicense() || (showWhenNoAccount && !account)}
  <vbox class="payment-bar">
    {#await getLicense()}
      <!-- Checking license... -->
    {:then}
      {#if license.isSoonExpiring}
        <SoonExpiring {license} />
      {:else if license.isExpired}
        <Expired {license} />
      {:else if license.valid && !wasValid}
        <PaidJustNow />
      {:else if license.valid}
        <!-- Have valid license -->
      {:else if owlLicense}
        <Upgrade {license} {owlLicense} />
      {:else}
        <NeverPaid message={neverLicensedText} />
      {/if}
    {:catch ex}
      <ErrorMessageInline {ex} />
    {/await}
  </vbox>
{/if}

<script lang="ts">
  import { checkSavedLicense, Ticket, BadTicket } from "../../../../logic/util/LicenseClient";
  import { Account } from "../../../../logic/Abstract/Account";
  import PaidJustNow from "./PaidJustNow.svelte";
  import SoonExpiring from "./SoonExpiring.svelte";
  import Upgrade from "./Upgrade.svelte";
  import Expired from "./Expired.svelte";
  import NeverPaid from "./NeverPaid.svelte";
  import ErrorMessageInline from "../../../Shared/ErrorMessageInline.svelte";

  /** If given, the bar shows only if this account needs a license.
   * If not passed, the bar always shows. */
  export let account: Account | null = null;
  export let showWhenNoAccount: boolean;
  export let neverLicensedText: string = undefined;

  let license: Ticket = new BadTicket();
  let owlLicense: Ticket | null = null;
  let wasValid = false; // to detect that the license was just purchased

  async function getLicense() {
    license = await checkSavedLicense();
    wasValid = license.valid;
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
  .payment-bar {
    border-radius: inherit;
  }
  /*.payment-bar {
    box-shadow: -1px 0px 5px 0.5px rgb(0, 0, 0, 10%);
  }*/
  .payment-bar :global(.message) {
    margin-inline-end: 12px;
  }
</style>
