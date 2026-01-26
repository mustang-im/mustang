<!-- Lets the user pick which kind of special action he wants to add to the message,
 and adds an empty data structure to `sml`.
 The actual editing then happens in `SMLCreateKinds` -->
<vbox>
  <hbox class="title">{$t`Add`}</hbox>
  <hbox class="actions">
    <Button
      label={$t`Poll`}
      icon={PollIcon}
      onClick={addPoll}
      />
    <Button
      label={$t`Meeting time poll`}
      icon={MeetingTimePollIcon}
      onClick={addMeetingTimePoll}
      />
    <Button
      label={$t`Book me`}
      icon={BookMeIcon}
      onClick={addBookMe}
      />
  </hbox>
</vbox>

<script lang="ts">
  import { SMLData } from "../../../logic/Mail/SML/SMLData";
  import { createPoll, createMeetingTimePoll, createBookMe } from "../../../logic/Mail/SML/SMLCreateKind";
  import { SMLHTTPAccount } from "../../../logic/Mail/SML/SMLHTTPAccount";
  import type { MailIdentity } from "../../../logic/Mail/MailIdentity";
  import Button from "../../Shared/Button.svelte";
  import PollIcon from "lucide-svelte/icons/list-checks";
  import MeetingTimePollIcon from "lucide-svelte/icons/calendar-clock";
  import BookMeIcon from "lucide-svelte/icons/calendar-check";
  import { showError } from "../../Util/error";
  import { t } from "../../../l10n/l10n";
  import { createEventDispatcher } from 'svelte';
  const dispatchEvent = createEventDispatcher<{ close: void }>();

  export let sml: SMLData;
  export let identity: MailIdentity;

  function addPoll() {
    sml = createPoll(identity);
    registerSMLHTTP()
      .catch(showError);
    close();
  }

  function addMeetingTimePoll() {
    sml = createMeetingTimePoll(identity);
    registerSMLHTTP()
      .catch(showError);
    close();
  }

  function addBookMe() {
    sml = createBookMe(identity);
    registerSMLHTTP()
      .catch(showError);
    close();
  }

  /**
   * Registers an SML HTTP account, if not yet done.
   *
   * @warning Waits for email, so often takes minutes or hangs entirely. Do not `await` it.
   */
  async function registerSMLHTTP() {
    let acc = SMLHTTPAccount.getOrCreateAccount(identity.emailAddress, identity.realname);
    if (!acc.isLoggedIn) {
      acc.mailAccount = identity.account;
      await acc.login(); // waits for email, so often takes minutes or hangs entirely
    }
  }

  function close() {
    dispatchEvent("close");
  }
</script>

<style>
  .title {
    justify-content: center;
    font-weight: bold;
    margin-block-end: 16px;
  }
  .actions {
    flex-wrap: wrap;
    gap: 18px;
    max-width: 30em;
  }
  .actions :global(button.button) {
    padding: 12px 16px;
  }
</style>
