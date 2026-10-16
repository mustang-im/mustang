<RibbonGroup label={$t`Polls`}>
  {#each kinds as kind}
    <RibbonButton label={SMLKinds.label(kind)} icon={SMLKinds.icon(kind)}
      tooltip={tooltip(kind)}
      disabled={commands.sml ? $t`The message already has a poll. Remove it first.` : !commands.identity}
      onClick={() => insert(kind)} />
  {/each}
</RibbonGroup>

<script lang="ts">
  import type { ComposerCommands } from "./ComposerCommands";
  import { SMLKind, SMLKinds } from "../SML/SMLKinds";
  import RibbonGroup from "../../Shared/Ribbon/RibbonGroup.svelte";
  import RibbonButton from "../../Shared/Ribbon/RibbonButton.svelte";
  import { gt, t } from "../../../l10n/l10n";

  export let commands: ComposerCommands;

  const kinds = [SMLKind.Poll, SMLKind.SchedulingPoll, SMLKind.Bookings];

  function tooltip(kind: SMLKind): string {
    switch (kind) {
      case SMLKind.Poll: return gt`Insert a poll: recipients choose one of the options`;
      case SMLKind.SchedulingPoll: return gt`Insert a scheduling poll: recipients vote for the meeting times that suit them`;
      case SMLKind.Bookings: return gt`Offer meeting times: the recipient books one of them with you`;
    }
  }

  async function insert(kind: SMLKind) {
    let identity = commands.identity;
    if (!await SMLKinds.ensureAccount(identity)) {
      return;
    }
    commands.onInsertSML(SMLKinds.create(kind, identity));
  }
</script>
