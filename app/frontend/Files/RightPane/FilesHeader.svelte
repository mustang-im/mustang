<hbox class="header">
  <hbox class="buttons" class:hidden={!dir.parent}>
    <RoundButton
      onClick={goBack}
      icon={BackIcon}
      iconSize="24px"
      padding="4px"
      border={false}
      />
  </hbox>

  <hbox class="parent-dirs font-small">
    {#each parentDirs as parent, i}
      <hbox class="parent-dir" on:click={changeTo(parent)}>
        {parent.name}
      </hbox>
      {#if i < parentDirs.length}
        <hbox class="dir-separator">
          <SubIcon size="16px" />
        </hbox>
      {/if}
    {/each}
  </hbox>

  <hbox class="name">
    {dir.name}
  </hbox>

  <hbox flex />
  <hbox class="count font-small">
    {$t`${dir.subDirs.length + dir.files.length} files`}
  </hbox>
  <hbox class="buttons">
    <RoundButton
      onClick={addFile}
      icon={PlusIcon}
      iconSize="16px"
      padding="4px"
      classes="create"
      />
    <RightViewSwitcher />
  </hbox>
</hbox>

<script lang="ts">
  import { Directory } from "../../../logic/Files/Directory";
  import { selectedFolder } from "../selected";
  import { NotImplemented } from "../../../logic/util/util";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import RightViewSwitcher from "./RightViewSwitcher.svelte";
  import PlusIcon from "lucide-svelte/icons/plus";
  import BackIcon from "lucide-svelte/icons/chevron-left";
  import SubIcon from "lucide-svelte/icons/chevron-right";
  import { t } from "../../../l10n/l10n";

  export let dir: Directory;

  let parentDirs: Directory[] = [];
  $: dir, getParentDirs()
  function getParentDirs() {
    parentDirs = [];
    let cur = dir.parent;
    while (cur && !parentDirs.includes(cur)) {
      parentDirs.unshift(cur);
      cur = cur.parent;
    }
    console.log("Parent dirs", parentDirs.map(dir => dir.name).join(" / "), parentDirs)
  }

  function changeTo(dir: Directory) {
    $selectedFolder = dir;
  }
  function goBack() {
    if (!dir.parent) {
      return;
    }
    changeTo(dir.parent);
  }
  async function addFile() {
    throw new NotImplemented();
  }
</script>

<style>
  .header {
    align-items: center;
    margin-block: 4px;
    margin-inline: 8px;
  }
  .parent-dirs {
    align-items: center;
    margin-inline-start: 4px;
  }
  .parent-dir {
    padding-inline: 6px;
  }
  .parent-dir:hover {
    background-color: var(--hover-bg);
    color: var(--hover-fg);
  }
  .dir-separator {
    opacity: 50%;
  }
  .name {
    font-size: 120%;
    font-weight: bold;
    margin-inline-start: 20px;
  }
  .count {
    opacity: 75%;
    margin-inline-end: 16px;
  }
  .buttons {
    align-items: center;
  }
  .hidden {
    display: none;
  }
</style>
