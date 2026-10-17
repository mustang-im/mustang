{#if sml && kind}
  <vbox class="sml-editor">
    {#if preview}
      <SMLDisplayKinds {sml} message={mail}>
        <svelte:fragment slot="actions">
          <DialogButton label={$t`Edit`} icon={EditIcon} classes="plain" onClick={() => { preview = false; }} />
          <DialogButton label={$t`Remove`} icon={RemoveIcon} classes="plain" onClick={onRemove} />
        </svelte:fragment>
      </SMLDisplayKinds>
    {:else}
      <ActionCard title={SMLKinds.label(kind)} subtitle={editSubtitle(kind)} icon={SMLKinds.icon(kind)}>
        <svelte:fragment slot="actions">
          <DialogButton label={$t`Preview`} icon={PreviewIcon} classes="plain" onClick={() => { preview = true; }} />
          <DialogButton label={$t`Remove`} icon={RemoveIcon} classes="plain" onClick={onRemove} />
        </svelte:fragment>
        {#if kind == SMLKind.Poll}
          <PollEdit {sml} />
        {:else}
          <TimeOptionsEditor {sml} />
        {/if}
      </ActionCard>
    {/if}
  </vbox>
{/if}

<script lang="ts">
  import type { SMLData } from "../../../logic/Mail/SML/SMLData";
  import type { EMail } from "../../../logic/Mail/EMail";
  import { SMLKind, SMLKinds } from "../SML/SMLKinds";
  import ActionCard from "../SML/ActionCard.svelte";
  import SMLDisplayKinds from "../SML/SMLDisplayKinds.svelte";
  import PollEdit from "../SML/PollEdit.svelte";
  import TimeOptionsEditor from "../SML/TimeOptionsEditor.svelte";
  import DialogButton from "../../Shared/Dialog/DialogButton.svelte";
  import PreviewIcon from "lucide-svelte/icons/eye";
  import EditIcon from "lucide-svelte/icons/pencil";
  import RemoveIcon from "lucide-svelte/icons/trash-2";
  import { gt, t } from "../../../l10n/l10n";

  export let mail: EMail;
  export let sml: SMLData;
  export let onRemove: () => void;

  let preview = false;
  $: kind = SMLKinds.kindOf(sml);

  function editSubtitle(kind: SMLKind): string {
    switch (kind) {
      case SMLKind.Poll: return gt`Recipients choose one of the options.`;
      case SMLKind.SchedulingPoll: return gt`Recipients vote for the times that suit them.`;
      case SMLKind.Bookings: return gt`Recipients book one of the times with you.`;
      default: return null;
    }
  }
</script>

<style>
  .sml-editor {
    flex-shrink: 0;
    padding: 12px 0 4px 0;
  }
</style>
