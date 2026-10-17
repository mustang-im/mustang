<Ribbon>
  <ComposerMessageTab {commands} />
  <InsertTab editor={commands.editor} bind:openedTool onAttachFile={commands.onAttachFile} onInsertPicture={commands.onInsertPicture} bind:showEmojis>
    <svelte:fragment slot="include">
      <RibbonMenuButton label={$t`Signature`} icon={SignatureIcon}>
        <SignatureMenuItems identity={commands.identity} editor={commands.editor} onSignatures={commands.onSignatures} />
      </RibbonMenuButton>
    </svelte:fragment>
    <svelte:fragment slot="groups">
      <PollsGroup {commands} />
    </svelte:fragment>
  </InsertTab>
  <RibbonTab label={$t`Options`}>
    <ShowFieldsGroup canShowFrom={commands.canShowFrom} bccLocked={commands.bccLocked} />
    <EncryptionButtons mail={commands.mail} identity={commands.identity} />
  </RibbonTab>
  <FormatTextTab editor={commands.editor} bind:openedTool />
  <ReviewTab editor={commands.editor} bind:openedTool />
</Ribbon>

<script lang="ts">
  import type { ComposerCommands } from "./ComposerCommands";
  import type { EditorTool } from "../../Shared/Editor/EditorTool";
  import Ribbon from "../../Shared/Ribbon/Ribbon.svelte";
  import RibbonTab from "../../Shared/Ribbon/RibbonTab.svelte";
  import RibbonMenuButton from "../../Shared/Ribbon/RibbonMenuButton.svelte";
  import InsertTab from "../../Shared/Editor/InsertTab.svelte";
  import FormatTextTab from "../../Shared/Editor/FormatTextTab.svelte";
  import ReviewTab from "../../Shared/Editor/ReviewTab.svelte";
  import ComposerMessageTab from "./ComposerMessageTab.svelte";
  import ShowFieldsGroup from "./ShowFieldsGroup.svelte";
  import EncryptionButtons from "./EncryptionButtons.svelte";
  import SignatureMenuItems from "./SignatureMenuItems.svelte";
  import PollsGroup from "./PollsGroup.svelte";
  import SignatureIcon from "lucide-svelte/icons/pen-line";
  import { t } from "../../../l10n/l10n";

  export let commands: ComposerCommands;
  export let showEmojis = false;
  export let openedTool: EditorTool | null = null;
</script>
