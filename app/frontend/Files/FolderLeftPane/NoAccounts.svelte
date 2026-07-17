<vbox class="no-accounts">
  <hbox class="warn">
    {$t`No file sharing accounts configured` }
  </hbox>
  <hbox class="buttons">
    <Button
      label={$t`Add account…`}
      icon={PlusIcon}
      onClick={onSetupAccount}
      />
  </hbox>
</vbox>

<script lang="ts">
  import { getSettingsCategoryForApp } from "../../Settings/Window/CategoriesUtils";
  import { goTo } from "../../AppsBar/selectedApp";
  import Button from "../../Shared/Button.svelte";
  import PlusIcon from "lucide-svelte/icons/plus";
  import { t } from "../../../l10n/l10n";
  import { filesMustangApp } from "../FilesMustangApp";

  function onSetupAccount() {
    let category = getSettingsCategoryForApp(filesMustangApp);
    goTo(category.newAccountURL, {});
  }
</script>

<style>
  .no-accounts {
    padding: 24px;
  }
  .warn {
    flex-wrap: wrap;
  }
  .buttons {
    margin-block-start: 16px;
  }
</style>
