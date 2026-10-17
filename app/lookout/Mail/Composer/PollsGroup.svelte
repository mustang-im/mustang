<RibbonGroup label={$t`Polls`}>
  {#each types as type}
    <RibbonButton label={label(type)} icon={icon(type)}
      tooltip={tooltip(type)}
      disabled={commands.sml ? $t`The message already has a poll. Remove it first.` : !commands.identity}
      onClick={() => insert(type)} />
  {/each}
</RibbonGroup>

<script lang="ts">
  import type { ComposerCommands } from "./ComposerCommands";
  import type { SMLData } from "../../../logic/Mail/SML/SMLData";
  import type { MailIdentity } from "../../../logic/Mail/MailIdentity";
  import { createPoll, createMeetingTimePoll, createBookMe } from "../../../logic/Mail/SML/SMLCreateKind";
  import { SMLHTTPAccount } from "../../../logic/Mail/SML/SMLHTTPAccount";
  import { MessageBox } from "../../Shared/Dialog/MessageBox";
  import { showError } from "../../../frontend/Util/error";
  import RibbonGroup from "../../Shared/Ribbon/RibbonGroup.svelte";
  import RibbonButton from "../../Shared/Ribbon/RibbonButton.svelte";
  import PollIcon from "lucide-svelte/icons/list-checks";
  import SchedulingPollIcon from "lucide-svelte/icons/calendar-clock";
  import BookingsIcon from "lucide-svelte/icons/calendar-check";
  import { appName } from "../../../logic/build";
  import { gt, t } from "../../../l10n/l10n";

  export let commands: ComposerCommands;

  const types = ["SimplePoll", "MeetingTimePoll", "BookMe"];

  function tooltip(type: string): string {
    switch (type) {
      case "SimplePoll": return gt`Insert a poll: recipients choose one of the options`;
      case "MeetingTimePoll": return gt`Insert a scheduling poll: recipients vote for the meeting times that suit them`;
      case "BookMe": return gt`Offer meeting times: the recipient books one of them with you`;
      default: return "";
    }
  }

  async function insert(type: string) {
    let identity = commands.identity;
    if (!await ensureAccount(identity)) {
      return;
    }
    commands.onInsertSML(create(type, identity));
  }

  function create(type: string, identity: MailIdentity): SMLData {
    switch (type) {
      case "SimplePoll": return createPoll(identity);
      case "MeetingTimePoll": return createMeetingTimePoll(identity);
      case "BookMe": return createBookMe(identity);
      default: return null;
    }
  }

  async function ensureAccount(identity: MailIdentity): Promise<boolean> {
    if (identity.smlAccount) {
      return true;
    }
    let create = await MessageBox.confirm(gt`Polls`,
      gt`Polls and bookings need a free SML account for ${identity.emailAddress}. The SML server sends a confirmation message to this address, which ${appName} processes automatically.` + "\n\n" +
      gt`Do you want to create the account now?`,
      gt`Create Account`);
    if (!create) {
      return false;
    }
    let account = await SMLHTTPAccount.getOrCreateAccount(identity);
    if (!account.isLoggedIn) {
      account.login()
        .catch(showError);
    }
    return true;
  }

  /* <copied from="SMLComposer.svelte"> */
  function label(type: string): string {
    switch (type) {
      case "SimplePoll": return gt`Poll`;
      case "MeetingTimePoll": return gt`Scheduling Poll`;
      case "BookMe": return gt`Bookings`;
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
</script>
