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
  </hbox>
</vbox>

<script lang="ts">
  import { SMLData } from "../../../logic/Mail/SML/SMLParseProcessor";
  import type { TSMLChooseAction, TSMLThing } from "../../../logic/Mail/SML/TSML";
  import { SMLHTTPAccount } from "../../../logic/Mail/SML/SMLHTTPAccount";
  import type { MailIdentity } from "../../../logic/Mail/MailIdentity";
  import Button from "../../Shared/Button.svelte";
  import PollIcon from "lucide-svelte/icons/list-checks";
  import { showError } from "../../Util/error";
  import type { Json } from "../../../logic/util/util";
  import { t } from "../../../l10n/l10n";
  import { createEventDispatcher } from 'svelte';
  const dispatchEvent = createEventDispatcher<{ close: void }>();

  export let sml: SMLData;
  export let identity: MailIdentity;

  function addPoll() {
    setSML("ChooseAction", {
      description: "",
      actionOption: [],
      object: null,
      agent: null,
    } as TSMLChooseAction);
    registerSMLHTTP()
      .catch(showError);
    close();
  }

  function setSML(type: string, json: TSMLThing) {
    sml ??= new SMLData();
    sml.type = type;
    sml.context = "https://schema.org";
    json["@context"] = sml.context;
    json["@type"] = sml.type;
    sml.sml = json as any;
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
    font-weight: bold;
    margin-block-end: 16px;
  }
  .actions {
    flex-wrap: wrap;
  }
  .actions :global(button.button) {
    padding: 12px 16px;
  }
</style>
