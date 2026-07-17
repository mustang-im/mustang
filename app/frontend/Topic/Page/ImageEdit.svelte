<vbox class="image">
  <!-- TODO allow resize -->
  <img src={$image.src} alt={$image.description} />
  <Button
    classes="danger"
    onClick={myOnDelete}
    label={$t`Delete`}
    icon={TrashIcon}
    />
</vbox>

<script lang="ts">
  import { Image } from "../../../logic/Topic/PageContent";
  import { Topic } from "../../../logic/Topic/Topic";
  import Button from "../../Shared/Button.svelte";
  import TrashIcon from "lucide-svelte/icons/trash-2";
  import { t } from "../../../l10n/l10n";

  export let topic: Topic;
  export let image: Image;
  /** When set, called instead of mutating topic.content directly.
   *  Provided by the TipTap node view so deletion goes through the editor. */
  export let onDelete: (() => void) | null = null;

  function myOnDelete() {
    if (onDelete) {
      onDelete();
    } else {
      topic.content.remove(image);
      topic.save();
    }
  }
</script>

<style>
</style>
