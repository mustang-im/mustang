<vbox class="tags-settings">
  <HeaderGroupBox>
    <hbox slot="header">
      {$t`Tags`}
    </hbox>
    <hbox class="subtitle">{$t`Mark your messages, to create your custom workflows`}</hbox>

    <vbox class="tags">
      <TagSelector tags={availableTags} canAdd={true} canDelete={true} />
    </vbox>
  </HeaderGroupBox>
</vbox>

<script lang="ts">
  import { availableTags } from "../../../logic/Mail/Tag";
  import TagSelector from "../../Mail/Tag/TagSelector.svelte";
  import HeaderGroupBox from "../../Shared/HeaderGroupBox.svelte";
  import { t } from "../../../l10n/l10n";
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
</style>
