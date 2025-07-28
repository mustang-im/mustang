<vbox>
  <div>{$t`Your license is valid until ${getDateString(license.expiresOn)}`}</div>
  <hbox class="thankyou">
    <div>{$t`Thank you for your purchase.`}</div>
    <HeartIcon />
  </hbox>
</vbox>

<script lang="ts">
  import { Ticket } from "../../../../logic/util/LicenseClient";
  import { getDateString } from "../../../Util/date";
  import HeartIcon from "lucide-svelte/icons/heart";
  import { t } from "../../../../l10n/l10n";

  export let license: Ticket;
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
</style>
