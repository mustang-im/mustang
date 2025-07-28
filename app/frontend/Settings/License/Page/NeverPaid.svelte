<vbox>
  <div>{$t`You can buy a license for ${appName} at our website:`}</div>
  <hbox class="buttons">
    <Button
      label={$t`Buy`}
      onClick={() => openPurchasePage(paid => license = paid)}
      />
  </hbox>
</vbox>

<script lang="ts">
  import { Ticket, openPurchasePage } from "../../../../logic/util/LicenseClient";
  import { appName } from "../../../../logic/build";
  import Button from "../../../Shared/Button.svelte";
  import { t } from "../../../../l10n/l10n";

  export let license: Ticket;
</script>

<style>
  .buttons {
    margin-block-start: 8px;
  }
</style>
