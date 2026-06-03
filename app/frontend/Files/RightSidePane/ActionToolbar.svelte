<hbox class="action buttons">
  <Toolbar>
    <RoundButton
      onClick={onCopyLink}
      icon={LinkIcon}
      classes=""
      />
    <RoundButton
      onClick={onShare}
      icon={ShareIcon}
      classes=""
      />
    <RoundButton
      onClick={onOpenMoveMenu}
      icon={MoveIcon}
      classes=""
      />
    <RoundButton
      onClick={onDelete}
      icon={TrashIcon}
      classes="delete danger"
      />
  </Toolbar>
</hbox>

<script lang="ts">
  import type { FileOrDirectory } from "../../../logic/Files/FileOrDirectory";
  import Toolbar from "../../Shared/Toolbar/Toolbar.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import LinkIcon from "lucide-svelte/icons/link";
  import ShareIcon from "lucide-svelte/icons/share-2";
  import ShareMacIcon from "lucide-svelte/icons/share";
  import MoveIcon from "lucide-svelte/icons/folder-dot";
  import TrashIcon from "lucide-svelte/icons/trash-2";

  export let file: FileOrDirectory;

  async function onCopyLink() {
  }
  function onShare() {
  }
  function onOpenMoveMenu() {
  }
  async function onDelete() {
    await file.deleteIt();
  }
</script>

<style>
  .buttons {
    justify-content: end;
    gap: 8px;
  }
</style>
