<hbox class="buttons">
  <AppBarM>
    <!-- left -->
    <hbox class="settings">
      <Button
        icon={settingsMustangApp.icon}
        iconSize="24px"
        iconOnly
        label={settingsMustangApp.name}
        onClick={() => goTo("/settings/")}
        plain
        />
    </hbox>

    <!-- left middle -->
    <hbox class="empty" />

    <AppMenuButton onClick={onClose} />

    <!-- right middle -->
    <hbox class="empty" />

    <!-- right -->
    <hbox class="empty" />
  </AppBarM>
</hbox>

<script lang="ts">
  import { settingsMustangApp } from "../../Settings/Window/SettingsMustangApp";
  import { goTo } from "../selectedApp";
  import AppBarM from "../../AppsBar/AppBarM.svelte";
  import AppMenuButton from "../../AppsBar/AppMenuM/AppMenuButton.svelte";
  import Button from "../../Shared/Button.svelte";
  import { navigate } from "svelte-navigator";
  import { t } from "../../../l10n/l10n";

  function onClose() {
    navigate(-1);
  }
</script>

<style>
  .settings :global(button svg) {
    stroke-width: 2px;
  }
</style>
