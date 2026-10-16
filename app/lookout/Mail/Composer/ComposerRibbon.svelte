<Ribbon>
  <ComposerMessageTab {commands} />
  <InsertTab {commands} bind:showEmojis>
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
    <EncryptGroup mail={commands.mail} identity={commands.identity} />
  </RibbonTab>
  <FormatTextTab {commands} />
  <ReviewTab {commands} />
</Ribbon>

<script lang="ts">
  import type { ComposerCommands } from "./ComposerCommands";
  import Ribbon from "../../Shared/Ribbon/Ribbon.svelte";
  import RibbonTab from "../../Shared/Ribbon/RibbonTab.svelte";
  import RibbonMenuButton from "../../Shared/Ribbon/RibbonMenuButton.svelte";
  import InsertTab from "../../Shared/Editor/InsertTab.svelte";
  import FormatTextTab from "../../Shared/Editor/FormatTextTab.svelte";
  import ReviewTab from "../../Shared/Editor/ReviewTab.svelte";
  import ComposerMessageTab from "./ComposerMessageTab.svelte";
  import ShowFieldsGroup from "./ShowFieldsGroup.svelte";
  import EncryptGroup from "./EncryptGroup.svelte";
  import SignatureMenuItems from "./SignatureMenuItems.svelte";
  import PollsGroup from "./PollsGroup.svelte";
  import SignatureIcon from "lucide-svelte/icons/pen-line";
  import { t } from "../../../l10n/l10n";

  export let commands: ComposerCommands;
  export let showEmojis = false;
</script>
