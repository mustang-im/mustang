<vbox class="tags-settings">
  <HeaderGroupBox>
    <hbox slot="header">
      {$t`Tags`}
    </hbox>
    <hbox class="subtitle">{$t`Mark your messages, to create your custom workflows`}</hbox>

    <vbox class="tags">
      <TagSelector tags={availableTags} canAdd={true}>
        <RoundButton
          slot="tag-button"
          let:tag
          label={$t`Remove`}
          onClick={() => onRemove(tag)}
          icon={DeleteIcon}
          classes="small remove"
          iconSize="12px"
          padding="0px"
          border={false}
          />
      </TagSelector>
    </vbox>
  </HeaderGroupBox>
</vbox>

<script lang="ts">
  import { Tag, availableTags } from "../../../logic/Abstract/Tag";
  import TagSelector from "../../Shared/Tag/TagSelector.svelte";
  import HeaderGroupBox from "../../Shared/HeaderGroupBox.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import { t } from "../../../l10n/l10n";

  function onRemove(tag: Tag) {
    if (!confirm($t`Do you want to delete this tag entirely?`)) {
      return;
    }

    availableTags.remove(tag);
  }
</script>

<style>
  .tags-settings {
    max-width: 40em;
  }
  .subtitle {
    margin-block-end: 16px;
  }
  .tags :global(.tag) {
    font-size: 18px;
  }
  .tags :global(.remove) {
    padding: 2px;
  }
</style>
