<hbox class="payment-bar">
  <hbox flex />
  <div class="message">{message ?? $t`You can buy a license for ${appName} at our website`}</div>
  <hbox flex />
  <Button
    label={$t`Buy`}
    onClick={() => openSettingsCategoryByID("license")}
    classes="filled"
    />
</hbox>

<script lang="ts">
  import { openSettingsCategoryByID } from "../../Window/CategoriesUtils";
  import { appName } from "../../../../logic/build";
  import Button from "../../../Shared/Button.svelte";
  import { t } from "../../../../l10n/l10n";

  export let message: string = undefined;
</script>

<style>
  .payment-bar {
    padding: 6px 12px 6px 16px;
    align-items: center;
    background-color: #FFF160;
    color: #160C27;
    border-radius: inherit;
  }
  .payment-bar :global(button) {
    padding: 2px 12px !important;
  }
</style>
