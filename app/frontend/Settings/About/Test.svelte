<hbox class="buttons">
  <Button label={$t`Load test data`}
    onClick={loadTest}
    />
</hbox>

<script lang="ts">
  import { getTestObjects } from "../../../logic/testData";
  import { openApp } from "../../AppsBar/selectedApp";
  import { chatMustangApp } from "../../Chat/ChatMustangApp";
  import Button from "../../Shared/Button.svelte";
  import { t } from "../../../l10n/l10n";

  async function loadTest() {
    await getTestObjects();
    openApp(chatMustangApp);
  }
</script>

<style>
  .buttons {
    justify-content: start;
  }
</style>
