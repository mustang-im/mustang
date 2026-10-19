{#if sml && ["SimplePoll", "MeetingTimePoll", "BookMe"].includes(type)}
  <vbox class="sml-editor">
    {#if preview}
      <SMLDisplayKinds {sml} message={mail}>
        <svelte:fragment slot="actions">
          <DialogButton label={$t`Edit`} icon={EditIcon} classes="plain" onClick={() => { preview = false; }} />
          <DialogButton label={$t`Remove`} icon={RemoveIcon} classes="plain" onClick={onRemove} />
        </svelte:fragment>
      </SMLDisplayKinds>
    {:else}
      <ActionCard title={label(type)} subtitle={editSubtitle(type)} icon={icon(type)}>
        <svelte:fragment slot="actions">
          <DialogButton label={$t`Preview`} icon={PreviewIcon} classes="plain" onClick={() => { preview = true; }} />
          <DialogButton label={$t`Remove`} icon={RemoveIcon} classes="plain" onClick={onRemove} />
        </svelte:fragment>
        {#if type == "SimplePoll"}
          <PollEdit {sml} />
        {:else}
          <TimePollEdit {sml} />
        {/if}
      </ActionCard>
    {/if}
  </vbox>
{/if}

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import PollIcon from "lucide-svelte/icons/list-checks";
  import SchedulingPollIcon from "lucide-svelte/icons/calendar-clock";
  import BookingsIcon from "lucide-svelte/icons/calendar-check";
  import ActionCard from "../SML/ActionCard.svelte";
  import SMLDisplayKinds from "../SML/SMLDisplayKinds.svelte";
  import PollEdit from "../SML/PollEdit.svelte";
  import TimePollEdit from "../../Calendar/SML/Shared/PollEdit.svelte";
  import DialogButton from "../../Shared/Dialog/DialogButton.svelte";
  import PreviewIcon from "lucide-svelte/icons/eye";
  import EditIcon from "lucide-svelte/icons/pencil";
  import RemoveIcon from "lucide-svelte/icons/trash-2";
  import { t } from "../../../l10n/l10n";

  export let mail: EMail;

  $: sml = $mail.sml;
  function onRemove() {
    mail.sml = null;
  }

  let preview = false;
  $: type = sml?.type ?? sml?.sml?.["@type"];

  /* <copied to="PollsGroup.svelte"> */
  function label(type: string): string {
    switch (type) {
      case "SimplePoll": return $t`Poll`;
      case "MeetingTimePoll": return $t`Scheduling Poll`;
      case "BookMe": return $t`Bookings`;
      default: return "";
    }
  }
  /* </copied> */

  /* <copied from="../SML/SMLDisplayKinds.svelte"> */
  function icon(type: string): ConstructorOfATypedSvelteComponent {
    switch (type) {
      case "MeetingTimePoll": return SchedulingPollIcon;
      case "BookMe": return BookingsIcon;
      default: return PollIcon;
    }
  }
  /* </copied> */

  function editSubtitle(type: string): string {
    switch (type) {
      case "SimplePoll": return $t`Recipients choose one of the options.`;
      case "MeetingTimePoll": return $t`Recipients vote for the times that suit them.`;
      case "BookMe": return $t`Recipients book one of the times with you.`;
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
