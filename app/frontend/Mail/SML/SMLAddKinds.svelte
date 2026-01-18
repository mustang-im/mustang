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
  import { assert, type Json } from "../../../logic/util/util";
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

    console.log("starting tests");
    // Test
    let bundle = crypto.randomUUID();
    let mainRes = crypto.randomUUID();
    let mainContent = { "question": "abs" };
    let { resourceURL: mainURL } = await acc.saveResource(bundle, mainRes, false, mainContent);
    let userRes = crypto.randomUUID();
    let userContent = { "answer": 1 };
    let { resourceURL: userURL } = await acc.saveResource(bundle, userRes, true, userContent);

    let response = await fetch(mainURL);
    let mainContentResponse = await response.json();
    assert(mainContent.question == mainContentResponse.question, "Main does not match");
    response = await fetch(userURL);
    let userContentResponse = await response.json();
    assert(userContent.answer == userContentResponse.answer, "Answer does not match");

    let userContentChanged = { "answer": 2 };
    console.log("User URL", userURL);
    response = await fetch(userURL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userContentChanged),
    });
    let userContentChangedResponse = await response.json();
    assert(userContentChanged.answer == userContentChangedResponse.answer, "New answer does not match");

    let mainContentChanged = { "question": "2" };
    response = await fetch(mainURL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mainContentChanged),
    });
    let mainContentChangedResponse = mainContent;
    try {
      mainContentChangedResponse = await response.json();
      throw new Error("Should not be able to write to main resource without auth");
    } catch (ex) {
      console.log("Expected error:", ex);
    }
    assert(mainContentChanged.question != mainContentChangedResponse.question, "Main should not change without auth");
    let { resourceURL: mainURLChanged } = await acc.saveResource(bundle, mainRes, false, mainContentChanged);
    response = await fetch(userURL);
    mainContentChangedResponse = await response.json();
    assert(mainContentChanged.question == mainContentChangedResponse.question, "New main does not match");
    assert(mainURL == mainURLChanged, "URL should not change");
    console.log("tests succeeded");
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
