<Dialog title={$t`Trust Center`}
  okLabel={$t`OK`}
  onOK={onOK}
  width="820px"
  height="560px"
  on:close>
  <hbox flex class="trust-center">
    <CategoryList groups={pageGroups} bind:selected={page} />
    <vbox flex class="page" role="tabpanel">
      {#if page == "email-security"}
        <EmailSecurityPage {draft} {identity} bind:readAsPlainText />
      {/if}
    </vbox>
  </hbox>
</Dialog>

<script lang="ts">
  import type { MailIdentity } from "../../../logic/Mail/MailIdentity";
  import type { TrustCenterPage } from "../SettingsDialogs";
  import { OptionsModel } from "./OptionsModel";
  import { EmailSecurityDraft } from "./TrustCenter/EmailSecurityDraft";
  import CategoryList from "./CategoryList.svelte";
  import EmailSecurityPage from "./TrustCenter/EmailSecurityPage.svelte";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import { t } from "../../../l10n/l10n";

  export let options: OptionsModel = null;
  export let page: TrustCenterPage = "email-security";
  export let identity: MailIdentity = null;

  const isOwnOptions = !options;
  const optionsModel = options ?? new OptionsModel();
  const draft = new EmailSecurityDraft();
  let readAsPlainText = optionsModel.readAsPlainText.value;

  $: pageGroups = [
    [
      { id: "email-security", label: $t`Email Security` },
    ],
  ] as { id: TrustCenterPage, label: string }[][];

  async function onOK() {
    await draft.apply();
    optionsModel.readAsPlainText.value = readAsPlainText;
    if (isOwnOptions) {
      await optionsModel.save();
    }
  }
</script>

<style>
  .trust-center {
    gap: 16px;
    height: 100%;
    min-height: 0;
  }
  .page {
    min-width: 0;
    min-height: 0;
    padding-inline-end: 8px;
    overflow-y: auto;
  }
</style>
