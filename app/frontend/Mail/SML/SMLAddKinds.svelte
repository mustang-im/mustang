<!-- Lets the user pick which kind of special action he wants to add to the message,
 and adds an empty data structure to `sml`.
 The actual editing then happens in `SMLCreateKinds` -->
<vbox>
  <hbox class="title">{$t`Add`}</hbox>
  <hbox class="actions">
    {#if account}
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
    {:else}
      <Button
        label={$t`Create SML account`}
        icon={PollIcon}
        onClick={onRegister}
        />
    {/if}
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
  import { assert } from "../../../logic/util/util";
  import { t } from "../../../l10n/l10n";
  import { createEventDispatcher } from 'svelte';
  const dispatchEvent = createEventDispatcher<{ close: void }>();

  export let sml: SMLData;
  export let identity: MailIdentity;

  function addPoll() {
    sml = createPoll(identity);
    close();
  }

  function addMeetingTimePoll() {
    sml = createMeetingTimePoll(identity);
    close();
  }

  function addBookMe() {
    sml = createBookMe(identity);
    close();
  }

  function onRegister() {
    registerSMLHTTP()
      .catch(showError);
  }

  $: account = $identity.smlAccount;

  /**
   * Registers an SML HTTP account, if not yet done.
   *
   * @warning Waits for email, so often takes minutes or hangs entirely. Do not `await` it.
   */
  async function registerSMLHTTP() {
    assert(!account, "Already have an account");
    account = await SMLHTTPAccount.getOrCreateAccount(identity);
    if (!account.isLoggedIn) {
      await account.login(); // waits for email, so often takes minutes or hangs entirely
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
