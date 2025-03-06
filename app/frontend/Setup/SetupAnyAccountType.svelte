<Header title={$t`Set up another account`} />

<hbox class="add-buttons">
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

<hbox class="buttons-bottom">
  <hbox flex />
  <Button label={$t`Close`} classes="secondary"
    onClick={onClose}
    />
</hbox>

<script lang="ts">
  import { SetupMustangApp } from "./SetupMustangApp";
  import { mailMustangApp } from "../Mail/MailMustangApp";
  import { openApp } from "../AppsBar/selectedApp";
  import SetupMail from "./Mail/SetupMail.svelte";
  import SetupContacts from "./Contacts/SetupContacts.svelte";
  import SetupCalendar from "./Calendar/SetupCalendar.svelte";
  import SetupChat from "./Chat/SetupChat.svelte";
  import SetupMeetAccount from "./Meet/SetupMeetAccount.svelte";
  import SetupAnyAccountTypeDialog from "./SetupAnyAccountTypeDialog.svelte";
  import ExpanderButton from "../Shared/ExpanderButton.svelte";
  import Header from "./Shared/Header.svelte";
  import Button from "../Shared/Button.svelte";
  import { catchErrors } from "../Util/error";
  import { t } from "../../l10n/l10n";

  export let onContinue: () => void = null;

  async function startSetup(setupUI: ConstructorOfATypedSvelteComponent) {
    let setupApp = new SetupMustangApp();
    setupApp.mainWindow = setupUI;
    setupApp.onBack = () => startSetup(SetupAnyAccountTypeDialog);
    openApp(setupApp);
  }

  function onClose() {
    if (onContinue) {
      onContinue();
    } else {
      openApp(mailMustangApp);
    }
  }
</script>

<style>
  .add-buttons {
    display: grid;
    grid-template-columns: auto auto;
    flex-wrap: wrap;
  }
  .add-buttons :global(.expander-button) {
    margin-inline-end: 12px;
    margin-block-end: 8px;
    width: 100%;
    max-width: unset;
  }
  .add-buttons :global(.expander-button .button) {
    flex: 1 0 0;
  }
  .add-buttons :global(.expander-button .button .content) {
    flex: 1 0 0;
    min-height: 32px;
  }
  .add-buttons :global(.expander-button .button .content #text) {
    flex: 1 0 0;
  }

  .buttons-bottom {
    align-items: end;
    justify-content: end;
    margin-block-start: 32px;
  }
  .buttons-bottom :global(> *) {
    margin-inline-end: 8px;
  }
  .buttons-bottom :global(button.secondary) {
    background-color: inherit;
    font-weight: 300;
    color: #455468;
  }
</style>
