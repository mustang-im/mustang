<Button
  label={$t`Set picture`}
  icon={PictureIcon}
  onClick={onSelectPicture}
  {iconSize}
  iconOnly plain classes="set-picture" />
<FileSelector {acceptFileTypes} bind:this={fileSelector} />

<script lang="ts">
  import type { Person } from "../../../logic/Abstract/Person";
  import FileSelector from "../../Mail/Composer/Attachments/FileSelector.svelte";
  import Button from "../../Shared/Button.svelte";
  import PictureIcon from "lucide-svelte/icons/circle-user-round";
  import { blobToDataURL } from "../../../logic/util/util";
  import { t } from "../../../l10n/l10n";

  export let person: Person;
  export let iconSize = "16px";

  let fileSelector: FileSelector;
  const acceptFileTypes = [ "image/*", ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg" ];

  async function onSelectPicture() {
    let file = await fileSelector.selectFile();
    if (!file) {
      return;
    }
    person.picture = await blobToDataURL(file);
  }
</script>
