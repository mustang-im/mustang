<hbox class="buttons">
  <AppBarM>
    <!-- left -->
    {#if doingSearch}
      <hbox class="list">
        <Button
          icon={PersonsIcon}
          iconSize="24px"
          iconOnly
          label={$t`List persons`}
          onClick={goToList}
          plain
          />
      </hbox>
    {:else}
      <hbox class="search">
        <Button
          icon={SearchIcon}
          iconSize="24px"
          iconOnly
          label={$t`Search persons`}
          onClick={goToSearch}
          plain
          />
      </hbox>
    {/if}

    <!-- left middle -->
      <hbox class="empty" />

    <AppMenuButton />

    <!-- right middle -->
    <hbox class="empty" />

    <!-- right -->
    <hbox class="menu button">
      <ButtonMenu bind:isMenuOpen>
        <!--
        <MailMenu {selectedAccount} {selectedFolder} />
        -->
      </ButtonMenu>
    </hbox>
  </AppBarM>
</hbox>

<script lang="ts">
  import AppBarM from "../AppsBar/AppBarM.svelte";
  import ButtonMenu from "../Shared/Menu/ButtonMenu.svelte";
  import Button from "../Shared/Button.svelte";
  import AppMenuButton from "../AppsBar/AppMenuM/AppMenuButton.svelte";
  import PersonsIcon from "lucide-svelte/icons/users";
  import SearchIcon from "lucide-svelte/icons/search";
  import { t } from "../../l10n/l10n";

  export let doingSearch = false;

  let isMenuOpen = false;

  function goToList() {
    doingSearch = false;
  }

  function goToSearch() {
    doingSearch = true;
  }
</script>
