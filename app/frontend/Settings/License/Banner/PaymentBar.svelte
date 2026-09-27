{#if gLicense.license == license && (account?.needsLicense() || (showWhenNoAccount && !account))}
  <vbox class="payment-bar">
    {#if $license.paidJustNow}
      <PaidJustNow />
    {:else if $license.isSoonExpiring}
      <SoonExpiring />
    {:else if $license.isExpired}
      <Expired />
    {:else if !$license.valid}
      <NeverPaid message={neverLicensedText} />
    {/if}
  </vbox>
{/if}

<script lang="ts">
  import { license } from "../../../../logic/util/LicenseClient";
  import { gLicense } from "../../../../logic/util/License";
  import { Account } from "../../../../logic/Abstract/Account";
  import PaidJustNow from "./PaidJustNow.svelte";
  import SoonExpiring from "./SoonExpiring.svelte";
  import Expired from "./Expired.svelte";
  import NeverPaid from "./NeverPaid.svelte";

  /** If given, the bar shows only if this account needs a license.
   * If not passed, the bar always shows. */
  export let account: Account | null = null;
  export let showWhenNoAccount: boolean;
  export let neverLicensedText: string = undefined;
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
