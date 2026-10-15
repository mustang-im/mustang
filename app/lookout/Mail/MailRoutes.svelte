<vbox flex class="mail-page">
  <Ribbon>
    <RibbonTab label={$t`Home`}>
      <RibbonGroup label={$t`New`}>
        <RibbonButton label={$t`New Email`} icon={NewMailIcon}
          disabled={!$selectedAccount && !appGlobal.emailAccounts.hasItems}
          onClick={onNewMail} />
      </RibbonGroup>
      <RibbonGroup label={$t`Respond`}>
        <RibbonButton label={$t`Reply`} icon={ReplyIcon} disabled={$t`Select a message first`} />
        <RibbonButton label={$t`Reply All`} icon={ReplyAllIcon} disabled={$t`Select a message first`} />
        <RibbonButton label={$t`Forward`} icon={ForwardIcon} disabled={$t`Select a message first`} />
      </RibbonGroup>
    </RibbonTab>
  </Ribbon>
  <vbox flex class="coming lo-card">
    {$t`Mail is coming soon`}
  </vbox>
</vbox>

<script lang="ts">
  import { appGlobal } from "../../logic/app";
  import { selectedAccount } from "../../frontend/Mail/Selected";
  import { mailMustangApp } from "../../frontend/Mail/MailMustangApp";
  import Ribbon from "../Shared/Ribbon/Ribbon.svelte";
  import RibbonTab from "../Shared/Ribbon/RibbonTab.svelte";
  import RibbonGroup from "../Shared/Ribbon/RibbonGroup.svelte";
  import RibbonButton from "../Shared/Ribbon/RibbonButton.svelte";
  import NewMailIcon from "lucide-svelte/icons/mail-plus";
  import ReplyIcon from "lucide-svelte/icons/reply";
  import ReplyAllIcon from "lucide-svelte/icons/reply-all";
  import ForwardIcon from "lucide-svelte/icons/forward";
  import { t } from "../../l10n/l10n";

  function onNewMail() {
    let account = $selectedAccount ?? appGlobal.emailAccounts.first;
    mailMustangApp.writeMail(account.newEMailFrom());
  }
</script>

<style>
  .mail-page {
    min-height: 0;
  }
  .coming {
    margin: 0 8px 8px 8px;
    align-items: center;
    justify-content: center;
    color: var(--lo-fg-secondary);
  }
</style>
