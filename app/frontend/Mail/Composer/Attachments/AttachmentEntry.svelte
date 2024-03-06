<hbox class="attachment">
  <hbox class="icon">
    <FileIcon ext={file.name?.split(".").pop()} size={32} />
  </hbox>
  <vbox flex class="right">
    <hbox class="name">
      {file.name}
    </hbox>
    <hbox class="size">
      {Math.ceil(file.size / 1024)} KB
    </hbox>
  </vbox>
  <vbox class="buttons">
    <Button plain icon={ChevronDownIcon} iconSize="16px" iconOnly />
  </vbox>
</hbox>

<script lang="ts">
  import FileIcon from "../../../Files/FileIcon.svelte";
  import Button from "../../../Shared/Button.svelte";
  import ChevronDownIcon from "lucide-svelte/icons/chevron-down";

  export let file: File;
</script>

<style>
  .attachment {
    background-color: white;
    box-shadow: -1px 0px 5px 0.5px rgb(0, 0, 0, 10%);
    border-radius: 5px;
    margin: 4px 6px 4px 12px;
    padding: 4px;
  }
  .icon {
    color: lightgray;
    margin-right: 4px;
  }
  .icon :global(svg) {
    stroke-width: 1px;
  }
  .right {
    margin: 0px 4px;
  }
  .name {
    flex-wrap: wrap;
    font-size: 14px;
    font-weight: 500;
    line-height: 1.2;
  }
  .size {
    font-size: 14px;
    color: lightgray;
  }
  .buttons {
    align-items: start;
    margin-top: 4px;
  }
  .buttons :global(svg) {
    color: lightgrey;
  }
</style>
