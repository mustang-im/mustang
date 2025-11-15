<hbox class="payment-bar">
  <hbox flex />
  <div class="message">{$t`Your license has expired on ${getDateString(license.expiresOn)}`}</div>
  <hbox flex />
  <Button
    label={$t`Renew`}
    onClick={() => openSettingsCategoryByID("license")}
    classes="filled"
    />
</hbox>

<script lang="ts">
  import { openSettingsCategoryByID } from "../../Window/CategoriesUtils";
  import { Ticket } from "../../../../logic/util/LicenseClient";
  import { getDateString } from "../../../Util/date";
  import Button from "../../../Shared/Button.svelte";
  import { t } from "../../../../l10n/l10n";

  export let license: Ticket;
</script>

<style>
  .payment-bar {
    padding: 6px 16px;
    align-items: center;
    background-color: red;
    color: #160C27;
    border-radius: inherit;
  }
  .payment-bar :global(button) {
    padding: 2px 12px !important;
  }
</style>
