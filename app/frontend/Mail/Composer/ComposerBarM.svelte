<hbox class="buttons">
  <AppBarM>
    <!-- left -->
    <hbox>
    </hbox>

    <!-- left middle -->
    <hbox>
    </hbox>

    <!-- left center extra -->
    <hbox class="extra">
    </hbox>

    <AppMenuButton />

    <!-- right center extra -->
    <hbox class="extra">
      <Button
        icon={TrashIcon}
        iconSize="24px"
        iconOnly
        label={$t`Delete this message`}
        onClick={deleteMessage}
        disabled={!message}
        plain
        />
    </hbox>

    <!-- right middle -->
    <hbox class="trash">
    </hbox>

    <!-- right -->
    <hbox class="menu button">
      <ButtonMenu bind:isMenuOpen>
        <ComposerMenuM {message} />
      </ButtonMenu>
    </hbox>
  </AppBarM>
</hbox>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import ComposerMenuM from "./ComposerMenuM.svelte";
  import AppBarM from "../../AppsBar/AppBarM.svelte";
  import ButtonMenu from "../../Shared/Menu/ButtonMenu.svelte";
  import AppMenuButton from "../../AppsBar/AppMenuM/AppMenuButton.svelte";
  import Button from "../../Shared/Button.svelte";
  import TrashIcon from "lucide-svelte/icons/trash-2";
  import { t } from "../../../l10n/l10n";

  export let message: EMail;

  async function deleteMessage() {
    await message.deleteMessage();
  }

  let isMenuOpen = false;
</script>
