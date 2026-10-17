<Dialog title={$t`Other Settings`} okLabel={$t`OK`} onOK={save} width="580px" on:close
  okDisabled={useCompactLayout && !isValidChars && $t`Enter 10 to 999 characters`}>
  <vbox class="other-settings">
    <GroupBox label={$t`Column Headings and Rows`}>
      <hbox class="compact-row">
        <CheckBox label={$t`Use compact layout in widths smaller than`} bind:checked={useCompactLayout} />
        <SpinBox label={$t`Characters`} bind:value={compactLayoutChars} min={10} max={999} width="72px" disabled={!useCompactLayout} />
        <span class:disabled={!useCompactLayout}>{$t`characters`}</span>
      </hbox>
      <CheckBox label={$t`Use tighter spacing`} bind:checked={tighterSpacing} />
    </GroupBox>
    <GroupBox label={$t`Grid Lines and Group Headings`}>
      <CheckBox label={$t`Show items in Groups`} bind:checked={showInGroups} />
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
        <Radio label={$t`Right`} bind:group={readingPane} value="right" />
        <Radio label={$t`Bottom`} bind:group={readingPane} value="bottom" />
        <Radio label={$t`Off`} bind:group={readingPane} value="off" />
      </hbox>
    </GroupBox>
  </vbox>
</Dialog>

<script lang="ts">
  import type { ViewSettings } from "./ViewSettings";
  import type { ReadingPanePosition } from "../3pane/3Pane.svelte";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import GroupBox from "../../Shared/Form/GroupBox.svelte";
  import CheckBox from "../../Shared/Form/CheckBox.svelte";
  import Radio from "../../Shared/Form/Radio.svelte";
  import SpinBox from "../../Shared/Form/SpinBox.svelte";
  import { gt, t } from "../../../l10n/l10n";

  export let settings: ViewSettings;
  export let readingPanePosition: ReadingPanePosition;
  export let onOK: (changes: Partial<ViewSettings>, readingPane: ReadingPanePosition) => void;

  let showInGroups = settings.showInGroups;
  let tighterSpacing = settings.tighterSpacing;
  let previewLines = settings.previewLines;
  let useCompactLayout = settings.useCompactLayout;
  let compactLayoutChars = settings.compactLayoutChars;
  $: isValidChars = Number.isInteger(compactLayoutChars) && compactLayoutChars >= 10 && compactLayoutChars <= 999;
  let readingPane = readingPanePosition;

  const previewOptions = [
    { lines: 0, label: gt`Off` },
    { lines: 1, label: gt`1 Line` },
    { lines: 2, label: gt`2 Lines` },
    { lines: 3, label: gt`3 Lines` },
  ];

  function save() {
    onOK({ showInGroups, tighterSpacing, previewLines, useCompactLayout, compactLayoutChars }, readingPane);
  }
</script>

<style>
  .other-settings {
    gap: 12px;
  }
  .radios {
    gap: 20px;
  }
  .compact-row {
    align-items: center;
    gap: 8px;
  }
  .disabled {
    color: var(--lo-fg-disabled);
  }
</style>
