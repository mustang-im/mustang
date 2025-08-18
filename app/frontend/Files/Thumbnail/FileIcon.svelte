{#await getIcon(localFilePath, ext)}
  <!---->
{:then}
  {#if iconURL}
    <img src={iconURL} width={size} height={size} alt="" />
  {:else}
    <StaticFileIcon {ext} {size} />
  {/if}
{/await}

<script lang="ts">
  import { appGlobal } from "../../../logic/app";
  import StaticFileIcon from "./StaticFileIcon.svelte";

  /** TODO use mimetype */
  export let ext: string;
  export let localFilePath: string;
  export let size = 16;

  let iconURL: string;

  async function getIcon(_a: any, _b: any) {
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
