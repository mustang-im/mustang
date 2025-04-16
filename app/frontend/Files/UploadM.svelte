<vbox flex class="pane">
  Upload TODO
</vbox>

{#if $appGlobal.isMobile}
  <UploadBarM {person} on:uploadFile={uploadFile} on:uploadPicture={uploadPicture} />
{/if}

<script lang="ts">
  import type { Person } from "../../logic/Abstract/Person";
  import { appGlobal } from "../../logic/app";
  import UploadBarM from "./UploadBarM.svelte";

  export let person: Person;

  function uploadFile() {
    alert("upload file");
  }

  function uploadPicture() {
    alert("upload picture");
  }
</script>

<style>
  .pane {
    background-color: var(--main-bg);
    color: var(--main-fg);
  }
</style>
