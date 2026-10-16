<Dialog title={$t`Other Settings`} okLabel={$t`OK`} onOK={save} width="480px" on:close>
  <vbox class="other-settings">
    <GroupBox label={$t`Rows and groups`}>
      <CheckBox label={$t`Show items in Groups`} bind:checked={showInGroups} />
      <CheckBox label={$t`Use tighter spacing`} bind:checked={tighterSpacing} />
    </GroupBox>
    <GroupBox label={$t`Message Preview`}>
      <hbox class="radios">
        {#each previewOptions as option}
          <Radio label={option.label} bind:group={previewLines} value={option.lines} />
        {/each}
      </hbox>
    </GroupBox>
    <GroupBox label={$t`Reading Pane`}>
      <hbox class="radios">
        <Radio label={$t`Right`} bind:group={readingPane} value={ReadingPanePosition.Right} />
        <Radio label={$t`Bottom`} bind:group={readingPane} value={ReadingPanePosition.Bottom} />
        <Radio label={$t`Off`} bind:group={readingPane} value={ReadingPanePosition.Off} />
      </hbox>
    </GroupBox>
  </vbox>
</Dialog>

<script lang="ts">
  import type { ViewSettings } from "./ViewSettings";
  import { ReadingPanePosition } from "../MailView";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import GroupBox from "../../Shared/Form/GroupBox.svelte";
  import CheckBox from "../../Shared/Form/CheckBox.svelte";
  import Radio from "../../Shared/Form/Radio.svelte";
  import { gt, t } from "../../../l10n/l10n";

  export let settings: ViewSettings;
  export let readingPanePosition: ReadingPanePosition;
  export let onOK: (changes: Partial<ViewSettings>, readingPane: ReadingPanePosition) => void;

  let showInGroups = settings.showInGroups;
  let tighterSpacing = settings.tighterSpacing;
  let previewLines = settings.previewLines;
  let readingPane = readingPanePosition;

  const previewOptions = [
    { lines: 0, label: gt`Off` },
    { lines: 1, label: gt`1 Line` },
    { lines: 2, label: gt`2 Lines` },
    { lines: 3, label: gt`3 Lines` },
  ];

  function save() {
    onOK({ showInGroups, tighterSpacing, previewLines }, readingPane);
  }
</script>

<style>
  .other-settings {
    gap: 12px;
  }
  .radios {
    gap: 20px;
  }
</style>
