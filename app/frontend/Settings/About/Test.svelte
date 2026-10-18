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
  import { getNavigation } from "../../AppsBar/selectedApp";
  import { chatMustangApp } from "../../Chat/ChatMustangApp";
  import { appGlobal } from "../../../logic/app";
  import { getMailSelection } from "../../Mail/Selected";
  import { sleep } from "../../../logic/util/util";
  import Button from "../../Shared/Button.svelte";
  import { t } from "../../../l10n/l10n";

  const { openApp } = getNavigation();
  const { selectedAccount, selectedFolder } = getMailSelection();

  let isLoading = false;

  async function loadTest() {
    const { addTestDataToGlobal } = await import("../../../logic/testData");
    isLoading = true;
    appGlobal.emailAccounts.clear();
    appGlobal.chatAccounts.clear();
    appGlobal.meetAccounts.clear();
    appGlobal.calendars.clear();
    appGlobal.addressbooks.clear();
    appGlobal.fileSharingAccounts.clear();
    await sleep(0.1);
    await addTestDataToGlobal();
    appGlobal.personalAddressbook = appGlobal.addressbooks.first;
    appGlobal.collectedAddressbook = null;
    $selectedAccount = appGlobal.emailAccounts.first;
    $selectedFolder = $selectedAccount.rootFolders.first;
    isLoading = false;
    openApp(chatMustangApp, {});
  }
</script>

<style>
  .buttons {
    justify-content: end;
  }
</style>
