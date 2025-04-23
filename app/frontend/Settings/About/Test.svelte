<hbox class="buttons">
  {#if isLoading}
    {$t`Loading artificial test data for demo purposes. This may take a moment...`}
  {:else}
    <Button label={$t`Load test data`}
      onClick={loadTest}
      />
  {/if}
</hbox>

<script lang="ts">
  import { getTestObjects } from "../../../logic/testData";
  import { openApp } from "../../AppsBar/selectedApp";
  import { chatMustangApp } from "../../Chat/ChatMustangApp";
  import { appGlobal } from "../../../logic/app";
  import { sleep } from "../../../logic/util/util";
  import Button from "../../Shared/Button.svelte";
  import { t } from "../../../l10n/l10n";

  let isLoading = false;

  async function loadTest() {
    isLoading = true;
    appGlobal.emailAccounts.clear();
    appGlobal.chatAccounts.clear();
    appGlobal.meetAccounts.clear();
    appGlobal.calendars.clear();
    appGlobal.addressbooks.clear();
    appGlobal.personalAddressbook = null;
    appGlobal.collectedAddressbook = null;
    await sleep(0.1);
    await getTestObjects();
    isLoading = false;
    openApp(chatMustangApp);
  }
</script>

<style>
  .buttons {
    justify-content: end;
  }
</style>
