<hbox class="buttons">
  <AppBarM>
    <!-- left -->
    <hbox class="back">
      <Button
        icon={CategoriesIcon}
        iconSize="24px"
        iconOnly
        label={$t`All settings`}
        onClick={goToSettings}
        plain
        />
    </hbox>

    <!-- left middle -->
    <hbox class="empty" />

    <AppMenuButton />

    <!-- right middle -->
    <hbox class="empty" />

    <!-- right -->
    <hbox class="empty" />
  </AppBarM>
</hbox>

<script lang="ts">
  import { goTo } from "../../AppsBar/selectedApp";
  import AppBarM from "../../AppsBar/AppBarM.svelte";
  import Button from "../../Shared/Button.svelte";
  import AppMenuButton from "../../AppsBar/AppMenuM/AppMenuButton.svelte";
  import CategoriesIcon from "lucide-svelte/icons/list-tree";
  import { t } from "../../../l10n/l10n";

  function goToSettings() {
    goTo(`/settings`, {});
  }
</script>
