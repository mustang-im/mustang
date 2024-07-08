<Header title={$t(`Set up another account`)} />

<hbox class="buttons">
    <ExpanderButton
      on:expand={() => catchErrors(() => startSetup(SetupMail))}
      label={$t`Add email address`} />
    <ExpanderButton
      on:expand={() => catchErrors(() => startSetup(SetupContacts))}
      label={$t`Add address book`} />
    <ExpanderButton
      on:expand={() => catchErrors(() => startSetup(SetupCalendar))}
      label={$t`Add calendar`} />
    <ExpanderButton
      on:expand={() => catchErrors(() => startSetup(SetupChat))}
      label={$t`Add chat account`} />
    <ExpanderButton
      on:expand={() => catchErrors(() => startSetup(SetupMeetAccount))}
      label={$t`Add video conference account`} />
    <!--
    <ExpanderButton
      on:expand={() => catchErrors(() => startSetup(SetupFileAccount))}
      label={$t`Add file sharing`} />
    -->
</hbox>

<script lang="ts">
  import { SetupMustangApp } from "./SetupMustangApp";
  import { openApp } from "../../AppsBar/selectedApp";
  import ExpanderButtons from "../../Shared/ExpanderButtons.svelte";
  import ExpanderButton from "../../Shared/ExpanderButton.svelte";
  import SetupMail from "./Mail/SetupMail.svelte";
  import { catchErrors } from "../../Util/error";
  import { t } from "../../../l10n/l10n";
  import SetupContacts from "./Contacts/SetupContacts.svelte";
  import SetupCalendar from "./Calendar/SetupCalendar.svelte";
  import SetupChat from "./Chat/SetupChat.svelte";
  import SetupMeetAccount from "./Meet/SetupMeetAccount.svelte";
  import Header from "./Shared/Header.svelte";

  async function startSetup(setupUI: ConstructorOfATypedSvelteComponent) {
    let setupApp = new SetupMustangApp();
    setupApp.mainWindow = setupUI;
    openApp(setupApp);
  }
</script>

<style>
  .buttons {
    display: grid;
    grid-template-columns: auto auto;
    flex-wrap: wrap;
  }
  .buttons :global(.expander-button) {
    margin-inline-end: 12px;
    margin-block-end: 8px;
    width: 100%;
    max-width: unset;
  }
  .buttons :global(.expander-button .button) {
    flex: 1 0 0;
  }
  .buttons :global(.expander-button .button .content) {
    flex: 1 0 0;
    min-height: 32px;
  }
  .buttons :global(.expander-button .button .content #text) {
    flex: 1 0 0;
  }
</style>
