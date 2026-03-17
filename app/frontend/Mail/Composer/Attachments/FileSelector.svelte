<input type="file"
  bind:this={inputFileEl}
  bind:files
  accept={acceptFileTypes.join(",")}
  on:change={onFileSelected}
  on:cancel={onCancel}
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

  function onFileSelected() {
    if (!files.length) {
      doneFunc(null);
      return;
    }
    doneFunc(files[0]);
  }

  function onCancel() {
    doneFunc(null);
    return;
  }

  let inputFileEl: HTMLInputElement;
</script>

<style>
  input {
    display: none;
  }
</style>
