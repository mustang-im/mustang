<hbox class="payment-bar thankyou">
  <hbox flex />
  <div class="message">{$t`Thank you for your purchase.`}</div>
  <HeartIcon />
  <hbox flex />
</hbox>

<script lang="ts">
  import HeartIcon from "lucide-svelte/icons/heart";
  import { t } from "../../../../l10n/l10n";
</script>

<style>
  .payment-bar {
    padding: 6px 16px;
    align-items: center;
    background-color: turquoise;
    color: #160C27;
  }
  .thankyou :global(svg) {
    fill: red;
    stroke: #FF000033;
    margin-inline-start: 8px;
  }
</style>
