<RibbonGroup label={$t`Polls *=> Ribbon group to insert polls and bookings into the email`}>
  {#each types as type}
    <RibbonButton label={label(type)} icon={icon(type)}
      tooltip={tooltip(type)}
      disabled={$mail.sml ? $t`The message already has a poll. Remove it first.` : !identity}
      onClick={() => insert(type)} />
  {/each}
</RibbonGroup>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import type { SMLData } from "../../../logic/Mail/SML/SMLData";
  import type { MailIdentity } from "../../../logic/Mail/MailIdentity";
  import { createPoll, createMeetingTimePoll, createBookMe } from "../../../logic/Mail/SML/SMLCreateKind";
  import { SMLHTTPAccount } from "../../../logic/Mail/SML/SMLHTTPAccount";
  import { showMessageBox } from "../../Shared/Dialog/MessageBox";
  import { showError } from "../../../frontend/Util/error";
  import RibbonGroup from "../../Shared/Ribbon/RibbonGroup.svelte";
  import RibbonButton from "../../Shared/Ribbon/RibbonButton.svelte";
  import PollIcon from "lucide-svelte/icons/list-checks";
  import SchedulingPollIcon from "lucide-svelte/icons/calendar-clock";
  import BookingsIcon from "lucide-svelte/icons/calendar-check";
  import { appName } from "../../../logic/build";
  import { t } from "../../../l10n/l10n";

  export let mail: EMail;

  const types = ["SimplePoll", "MeetingTimePoll", "BookMe"];
  $: identity = mail.identity;

  function tooltip(type: string): string {
    switch (type) {
      case "SimplePoll": return $t`Insert a poll: recipients choose one of the options`;
      case "MeetingTimePoll": return $t`Insert a scheduling poll: recipients vote for the meeting times that suit them`;
      case "BookMe": return $t`Offer meeting times: the recipient books one of them with you`;
      default: return "";
    }
  }

  async function insert(type: string) {
    if (!await ensureAccount(identity)) {
      return;
    }
    mail.sml = create(type, identity);
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
    let create = await showMessageBox($t`Polls *=> Polls and bookings in emails`,
      $t`Polls and bookings need a free SML account for ${identity.emailAddress}. The SML server sends a confirmation message to this address, which ${appName} processes automatically.` + "\n\n" +
      $t`Do you want to create the account now?`,
      $t`Create Account`);
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
      case "SimplePoll": return $t`Poll *=> A poll in the email: recipients choose one of the options`;
      case "MeetingTimePoll": return $t`Scheduling Poll`;
      case "BookMe": return $t`Bookings *=> Meeting times in the email that the recipient can book`;
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
