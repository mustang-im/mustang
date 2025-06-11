{#await getIcon()}
  <FileIcon {ext} />
{:then}
  {#if iconURL}
    <img src={iconURL} width={size} height={size} alt="" />
  {:else}
    <FileIcon {ext} {size} />
  {/if}
{/await}

<script lang="ts">
  import { appGlobal } from "../../../logic/app";
  import FileIcon from "./FileIcon.svelte";

  /** TODO use mimetype */
  export let ext: string;
  export let localFilePath: string;
  export let size = 16;

  let iconURL: string;

  async function getIcon() {
    try {
      if (localFilePath) {
        iconURL = await appGlobal.remoteApp.getIconForLocalFile(localFilePath);
      } else {
        iconURL = await appGlobal.remoteApp.getIconForFileType(ext);
      }
    } catch (ex) {
      console.warn(ex);
    }
  }
</script>
