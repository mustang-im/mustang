<hbox class="name-container">
  {#if isRenaming}
    <input type="text" bind:value={name} autofocus />
  {:else}
    <Clickable onDoubleClick={onRenameStart}>
      <hbox class="name">
        {file.name}
      </hbox>
    </Clickable>
  {/if}
  <hbox flex />
  <hbox class="buttons">
    <RoundButton
      onClick={isRenaming ? onRenameSave : onRenameStart}
      icon={isRenaming ? OKIcon : PencilIcon}
      iconSize="16px"
      padding="6px"
      classes="rename plain"
      border={false}
      />
  </hbox>
</hbox>

<script lang="ts">
  import type { FileOrDirectory } from "../../../logic/Files/FileOrDirectory";
  import { File } from "../../../logic/Files/File";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import PencilIcon from "lucide-svelte/icons/pencil";
  import OKIcon from "lucide-svelte/icons/check";
  import Clickable from "../../Shared/Clickable.svelte";

  export let file: FileOrDirectory;

  let name = file.name;
  let isRenaming = false;
  function onRenameStart() {
    if (file instanceof File) {
      name = file.nameWithoutExt;
    } else {
      name = file.name;
    }
    isRenaming = true;
  }
  function onRenameSave() {
    if (file instanceof File) {
      file.name = name + (file.ext ? "." + file.ext : "");
      file.nameWithoutExt = name;
    } else {
      file.name = name;
    }
    isRenaming = false;
  }
</script>

<style>
  .name {
    font-size: 120%;
    font-weight: bold;
  }
  input {
    font-size: 120%;
    font-weight: bold;
  }
  .buttons {
    align-items: start;
  }
</style>
