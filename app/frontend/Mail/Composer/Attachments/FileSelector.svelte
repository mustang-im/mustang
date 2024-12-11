<!--
SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>

SPDX-License-Identifier: EUPL-1.2
-->

<input type="file"
  bind:this={inputFileEl}
  bind:files on:change={fileWasSelected}
  accept={acceptFileTypes.join(",")}
  />

<script lang="ts">
  export let acceptFileTypes: string[] = ["*"];

  let files: FileList;

  let doneFunc: (returnValue: File) => void;
  export async function selectFile(): Promise<File> {
    inputFileEl.click();
    return new Promise(resolve => {
      doneFunc = resolve;
    });
  }

  function fileWasSelected() {
    if (!files.length) {
      doneFunc(null);
      return;
    }
    doneFunc(files[0]);
  }

  let inputFileEl: HTMLInputElement;
</script>

<style>
  input {
    display: none;
  }
</style>
