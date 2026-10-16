<RibbonTab label={$t`Review`}>
  <RibbonGroup label={$t`Proofing`}>
    <RibbonToggleButton label={$t`Spelling & Grammar`} icon={SpellingIcon}
      tooltip={$t`Check spelling while typing`}
      bind:checked={$spellcheck.value} />
    <RibbonButton label={$t`Word Count`} icon={WordCountIcon}
      tooltip={$t`The number of words, characters and paragraphs in the text or the selection`}
      disabled={!commands.editor} onClick={() => commands.openTool(EditorTool.WordCount)} />
  </RibbonGroup>
</RibbonTab>

<script lang="ts">
  import { EditorTool, type EditorCommands } from "./EditorCommands";
  import { EditorSettings } from "./EditorSettings";
  import RibbonTab from "../Ribbon/RibbonTab.svelte";
  import RibbonGroup from "../Ribbon/RibbonGroup.svelte";
  import RibbonButton from "../Ribbon/RibbonButton.svelte";
  import RibbonToggleButton from "../Ribbon/RibbonToggleButton.svelte";
  import SpellingIcon from "lucide-svelte/icons/spell-check";
  import WordCountIcon from "lucide-svelte/icons/whole-word";
  import { t } from "../../../l10n/l10n";

  export let commands: EditorCommands;

  const spellcheck = EditorSettings.spellcheck;
</script>
