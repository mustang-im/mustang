<Dialog title={$t`Color Categories`}
  cancelLabel={$t`Close`}
  width="560px"
  on:close>
  <vbox class="dialog-content">
    <TagsSettings />
  </vbox>
</Dialog>

<script lang="ts">
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import TagsSettings from "../../../frontend/Settings/Mail/Tags.svelte";
  import { t } from "../../../l10n/l10n";
</script>

<style>
  .dialog-content :global(.group) {
    margin-block-start: 0;
  }
</style>
