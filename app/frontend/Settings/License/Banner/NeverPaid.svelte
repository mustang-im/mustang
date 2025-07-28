<hbox class="payment-bar">
  <hbox flex />
  <div class="message">{$t`You can buy a license for ${appName} at our website`}</div>
  <hbox flex />
  <Button
    label={$t`Buy`}
    onClick={() => openPurchasePage(paid => license = paid)}
    classes="filled"
    />
</hbox>

<script lang="ts">
  import { Ticket, openPurchasePage } from "../../../../logic/util/LicenseClient";
  import { appName } from "../../../../logic/build";
  import Button from "../../../Shared/Button.svelte";
  import { t } from "../../../../l10n/l10n";

  export let license: Ticket;
</script>

<style>
  .payment-bar {
    padding: 6px 16px;
    align-items: center;
    background-color: #FFF160;
    color: #160C27;
  }
</style>
