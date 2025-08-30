{#if $selectedPerson}
  <CombinedButton
    icon1={mailMustangApp.icon}
    icon2={$selectedPerson.picture ?? PersonIcon}
    onClick={() => searchPersonMails($selectedPerson)} />
{:else}
  <hbox class="empty" />
{/if}
<AccountButton account={appGlobal.emailAccounts.get(0)} {goToAccount} defaultIcon={AccountIcon} />
<AppButton app={mailMustangApp} page="/mail/" />
<CombinedButton icon1={mailMustangApp.icon} icon2={SearchIcon} page="/mail/search" />
<CombinedButton icon1={mailMustangApp.icon} icon2={PencilIcon} page="/mail/compose" />

<script lang="ts">
  import { MailAccount } from "../../../../logic/Mail/MailAccount";
  import { mailMustangApp } from "../../../Mail/MailMustangApp";
  import { Person } from "../../../../logic/Abstract/Person";
  import { newSearchEMail } from "../../../../logic/Mail/Store/setStorage";
  import { selectedAccount, selectedFolder } from "../../../Mail/Selected";
  import { selectedPerson } from "../../../Contacts/Person/Selected";
  import { goTo } from "../../selectedApp";
  import { appGlobal } from "../../../../logic/app";
  import AccountButton from "../AccountButton.svelte";
  import AppButton from "../AppButton.svelte";
  import CombinedButton from "../CombinedButton.svelte";
  import SearchIcon from "lucide-svelte/icons/search";
  import PersonIcon from "lucide-svelte/icons/user";
  import PencilIcon from "lucide-svelte/icons/pencil";
  import AccountIcon from "lucide-svelte/icons/inbox";
  import { URLPart } from "../../../Util/util";
  import { ArrayColl, mergeColl, mergeColls } from "svelte-collections";
  import { EMail } from "../../../../logic/Mail/EMail";

  function goToAccount(account: MailAccount) {
    $selectedAccount = account;
    $selectedFolder = account.inbox;
    goTo(URLPart`/mail/folder/${account.id}/${account.inbox.id ?? "noid"}/message-list`, {
      account,
      folder: account.inbox,
    });
  }

  async function searchPersonMails(person: Person) {
    let searchMessages = mergeColl(new ArrayColl<EMail>());
    goTo("/mail/person", { searchMessages });

    let search = newSearchEMail();
    search.includesPerson = person;
    let result = await search.startSearch();
    searchMessages.addColl(result);
  }
</script>
