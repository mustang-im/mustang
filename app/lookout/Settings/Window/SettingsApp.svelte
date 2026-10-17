<Dialog title={$t`${appName} Options`}
  okLabel={$t`OK`}
  okDisabled={!!accountWithMissingField && $t`Please fill in all required fields of ${accountWithMissingField.name}`}
  onOK={onOK}
  width="920px"
  height="680px"
  on:close>
  <hbox flex class="options-dialog" on:input={() => options = options}>
    <CategoriesPane groups={categoryGroups} bind:selection {onAddAccount} />
    <vbox flex class="page" role="tabpanel">
      {#if selection.account}
        {#key selection.account}
          {#if selection.accountPage == "server"}
            <AccountMailServer account={selection.account} draft={options.accountDraftOf(selection.account)} />
          {:else if selection.accountPage == "identities" && selection.account instanceof MailAccount}
            <AccountIdentity account={selection.account} draft={options.identitiesDraftOf(selection.account)} />
          {:else if selection.accountPage == "work-hours" && selection.account instanceof Calendar}
            <OptionsPage icon={CalendarIcon} description={$t`Set the days and hours when you work. The calendar shades the time outside of them.`}>
              <CalendarWorkHours account={selection.account} />
            </OptionsPage>
          {:else}
            <AccountGeneral account={selection.account} draft={options.accountDraftOf(selection.account)}
              icon={accountIcon(selection.account)} {onOpenAccount} {onRemoved} />
          {/if}
        {/key}
      {:else if selection.category == "general"}
        <GlobalAppearance {options} />
      {:else if selection.category == "mail"}
        <MailGeneral {options} />
      {:else if selection.category == "calendar"}
        <CalendarGeneral />
      {:else if selection.category == "people"}
        <ContactsGeneral />
      {:else if selection.category == "language"}
        <GlobalLanguage {options} />
      {:else if selection.category == "advanced"}
        <GlobalAdvanced {options} />
      {:else if selection.category == "trust-center"}
        <TrustCenterGeneral {options} />
      {/if}
    </vbox>
  </hbox>
</Dialog>

<script lang="ts">
  import type { Account } from "../../../logic/Abstract/Account";
  import type { OptionsCategory } from "../SettingsDialogs";
  import { SettingsDialogs } from "../SettingsDialogs";
  import { OptionsModel } from "./OptionsModel";
  import { OptionsNavigation, type OptionsSelection } from "./OptionsNavigation";
  import { Calendar } from "../../../logic/Calendar/Calendar";
  import { Addressbook } from "../../../logic/Contacts/Addressbook";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import GlobalAppearance from "../Global/Appearance.svelte";
  import MailGeneral from "../Mail/General.svelte";
  import CalendarGeneral from "../Calendar/General.svelte";
  import ContactsGeneral from "../Contacts/General.svelte";
  import GlobalLanguage from "../Global/Language.svelte";
  import GlobalAdvanced from "../Global/Advanced.svelte";
  import TrustCenterGeneral from "../TrustCenter/General.svelte";
  import CategoriesPane from "./CategoriesPane.svelte";
  import OptionsPage from "../Shared/OptionsPage.svelte";
  import CalendarWorkHours from "../Calendar/WorkHours.svelte";
  import AccountGeneral from "../AccountGeneral.svelte";
  import AccountMailServer from "../Mail/Account/Server.svelte";
  import AccountIdentity from "../Mail/Account/Identity.svelte";
  import { MailAccount } from "../../../logic/Mail/MailAccount";
  import MailIcon from "lucide-svelte/icons/mail";
  import CalendarIcon from "lucide-svelte/icons/calendar";
  import AddressbookIcon from "lucide-svelte/icons/book-user";
  import { appName } from "../../../logic/build";
  import { catchErrors } from "../../../frontend/Util/error";
  import { onMount } from "svelte";
  import { t } from "../../../l10n/l10n";

  export let selection: OptionsSelection = { category: "general", account: null, accountPage: "general" };

  let options = new OptionsModel();
  $: accountWithMissingField = options.accountWithMissingField;

  $: categoryGroups = [
    [
      { id: "general", label: $t`General` },
      { id: "mail", label: $t`Mail` },
      { id: "calendar", label: $t`Calendar` },
      { id: "people", label: $t`People` },
      { id: "language", label: $t`Language` },
      { id: "advanced", label: $t`Advanced` },
    ],
    [
      { id: "trust-center", label: $t`Trust Center` },
    ],
  ] as { id: OptionsCategory, label: string }[][];

  function accountIcon(account: Account): ConstructorOfATypedSvelteComponent {
    return account instanceof Calendar ? CalendarIcon : account instanceof Addressbook ? AddressbookIcon : MailIcon;
  }

  function onOpenAccount(account: Account) {
    selection = { category: OptionsNavigation.categoryOf(account), account, accountPage: "general" };
  }

  function onRemoved(account: Account) {
    options.forgetAccount(account);
    selection = { category: selection.category, account: null, accountPage: "general" };
    options = options;
  }

  function onAddAccount(category: OptionsCategory) {
    if (category == "mail") {
      SettingsDialogs.openSetup("/setup/mail", { kind: "options", category: "mail" });
    } else {
      SettingsDialogs.open({ kind: "new-folder-account", folderKind: category == "calendar" ? "calendar" : "addressbook" });
    }
  }

  onMount(() => catchErrors(onLoad));
  async function onLoad() {
    await options.loadDefaultMailApp();
  }

  async function onOK() {
    await options.save();
  }
</script>

<style>
  .options-dialog {
    gap: 16px;
    height: 100%;
    min-height: 0;
  }
  .page {
    min-width: 0;
    min-height: 0;
    overflow-y: auto;
  }
</style>
