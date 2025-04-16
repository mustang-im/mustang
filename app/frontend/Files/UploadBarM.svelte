<hbox class="buttons">
  <AppBarM>
    <!-- left -->
    <hbox class="list">
      <Button
        icon={PersonsIcon}
        iconSize="24px"
        iconOnly
        label={$t`List persons`}
        onClick={goToPersons}
        plain
        />
    </hbox>

    <!-- left middle -->
    <hbox class="list">
      <Button
        icon={PictureIcon}
        iconSize="24px"
        iconOnly
        label={$t`Upload picture`}
        onClick={uploadPicture}
        plain
        />
    </hbox>

    <AppMenuButton />

    <!-- right middle -->
    <hbox class="list">
      <Button
        icon={FileIcon}
        iconSize="24px"
        iconOnly
        label={$t`Upload file`}
        onClick={uploadFile}
        plain
        />
    </hbox>

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
  import { Person } from "../../logic/Abstract/Person";
  import AppBarM from "../AppsBar/AppBarM.svelte";
  import ButtonMenu from "../Shared/Menu/ButtonMenu.svelte";
  import Button from "../Shared/Button.svelte";
  import AppMenuButton from "../AppsBar/AppMenuM/AppMenuButton.svelte";
  import PersonsIcon from "lucide-svelte/icons/users";
  import PictureIcon from "lucide-svelte/icons/picture";
  import FileIcon from "lucide-svelte/icons/file";
  import { t } from "../../l10n/l10n";
  import { createEventDispatcher, onMount } from 'svelte';
  const dispatchEvent = createEventDispatcher<{ uploadFile: void, uploadPicture: void }>();

  export let person: Person;
  export let doingSearch = false;

  let isMenuOpen = false;

  function goToPersons() {
    doingSearch = false;
  }

  function uploadFile() {
    dispatchEvent("uploadFile");
  }

  function uploadPicture() {
    dispatchEvent("uploadPicture");
  }
</script>
