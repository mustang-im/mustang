<vbox class="settings" flex>
  <HeaderGroupBox>
    <hbox slot="header">{$t`Phone numbers`}</hbox>
    <hbox>
      <hbox class="label">{$t`Country code`}</hbox>
      <hbox class="input">+<input type="number" bind:value={account.countryCode} min={1} max={999}  on:change={onChange} /></hbox>
    </hbox>
  </HeaderGroupBox>
</vbox>

<script lang="ts">
  import { SIPAccount } from "../../../logic/Meet/SIP/SIPAccount";
  import HeaderGroupBox from "../../Shared/HeaderGroupBox.svelte";
  import { catchErrors } from "../../Util/error";
  import debounce from "lodash/debounce";
  import { t } from "../../../l10n/l10n";

  export let account: SIPAccount;

  const onChange = debounce(() => catchErrors(onSave), 500);
  async function onSave() {
    await account.save();
  }
</script>

<style>
  .settings {
    align-items: start;
    justify-content: start;
  }
  .settings > :global(.group) {
    width: 100%;
  }
  .label {
    margin-inline-end: 24px;
  }
</style>
