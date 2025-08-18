<vbox>
  <div>{$t`Your license has expired on ${getDateString(license.expiresOn)}`}</div>
  <hbox class="buttons">
    <Button
      label={$t`Renew`}
      onClick={() => openPurchasePage(paid => license = paid)}
      />
  </hbox>
</vbox>

<script lang="ts">
  import { Ticket, openPurchasePage } from "../../../../logic/util/LicenseClient";
  import { getDateString } from "../../../Util/date";
  import Button from "../../../Shared/Button.svelte";
  import { t } from "../../../../l10n/l10n";

  export let license: Ticket;
</script>

<style>
  .buttons {
    margin-block-start: 8px;
  }
</style>
