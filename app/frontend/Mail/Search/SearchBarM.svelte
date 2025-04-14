<hbox class="buttons">
  <AppBarM>
    <!-- left -->
    <hbox class="accounts">
      <Button
        icon={AccountIcon}
        iconSize="32px"
        iconOnly
        label={$t`Select account or folder`}
        onClick={goToAccounts}
        plain
        />
    </hbox>

    <!-- left middle -->
    <hbox class="msglist">
      <Button
        icon={SearchIcon}
        iconSize="32px"
        iconOnly
        label={$t`Search messages`}
        onClick={goToSearch}
        plain
        />
    </hbox>

    <AppMenuButton />

    <!-- right middle -->
    <hbox class="empty" />

    <!-- right -->
    <hbox class="empty" />
  </AppBarM>
</hbox>

<script lang="ts">
  import AppBarM from "../../AppsBar/AppBarM.svelte";
  import Button from "../../Shared/Button.svelte";
  import AppMenuButton from "../../AppsBar/AppMenuM/AppMenuButton.svelte";
  import SearchIcon from "lucide-svelte/icons/search";
  import AccountIcon from "lucide-svelte/icons/rabbit";
  import { goTo } from "../../AppsBar/selectedApp";
  import { t } from "../../../l10n/l10n";

  function goToAccounts() {
    goTo("/");
  }
  function goToSearch() {
    goTo("/mail/search");
  }
</script>
