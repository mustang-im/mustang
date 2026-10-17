<Dialog title={$t`Filter`} okLabel={$t`OK`} onOK={save} width="540px" on:close>
  <DialogTabs tabs={[{ id: "messages", label: $t`Messages` }, { id: "more", label: $t`More Choices` }]}
    bind:selected={tab} />
  <vbox class="tab-page">
    {#if tab == "messages"}
      <FormGrid columns="190px minmax(0, 1fr)">
        <span class="lo-form-label">{$t`Search for the word(s):`}</span>
        <TextField label={$t`Search for the word(s):`} bind:value={words} />
        <span class="lo-form-label">{$t`In:`}</span>
        <ComboBox label={$t`In:`} options={inOptions} value="body"
          disabled={$t`The words are searched in the subject and the message text`} width="100%" />
      </FormGrid>
    {:else}
      <FormGrid columns="190px minmax(0, 1fr)">
        <CheckBox label={$t`Only items that are:`} bind:checked={isReadFiltered} />
        <ComboBox label={$t`Only items that are:`} options={readOptions} bind:value={readValue}
          disabled={!isReadFiltered} width="100%" />
        <CheckBox label={$t`Only items with:`} bind:checked={isAttachmentFiltered} />
        <ComboBox label={$t`Only items with:`} options={attachmentOptions} bind:value={attachmentValue}
          disabled={!isAttachmentFiltered} width="100%" />
        <CheckBox label={$t`Only items which:`} bind:checked={isFlagFiltered} />
        <ComboBox label={$t`Only items which:`} options={flagOptions} bind:value={flagValue}
          disabled={!isFlagFiltered} width="100%" />
      </FormGrid>
    {/if}
  </vbox>
  <svelte:fragment slot="buttons-start">
    <DialogButton label={$t`Clear All`} onClick={clearAll} />
  </svelte:fragment>
</Dialog>

<script lang="ts">
  import { quickSearch } from "../../../frontend/Mail/Selected";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import DialogButton from "../../Shared/Dialog/DialogButton.svelte";
  import DialogTabs from "../../Shared/Dialog/DialogTabs.svelte";
  import FormGrid from "../../Shared/Form/FormGrid.svelte";
  import TextField from "../../Shared/Form/TextField.svelte";
  import ComboBox from "../../Shared/Form/ComboBox.svelte";
  import CheckBox from "../../Shared/Form/CheckBox.svelte";
  import type { ComboOption } from "../../Shared/Form/ComboOption";
  import { booleanHasValue } from "../../../logic/util/util";
  import { gt, t } from "../../../l10n/l10n";

  const inOptions: ComboOption<string>[] = [{ value: "body", label: gt`subject field and message body` }];
  const readOptions: ComboOption<boolean>[] = [
    { value: false, label: gt`unread` },
    { value: true, label: gt`read` },
  ];
  const attachmentOptions: ComboOption<boolean>[] = [
    { value: true, label: gt`one or more attachments` },
    { value: false, label: gt`no attachments` },
  ];
  const flagOptions: ComboOption<boolean>[] = [
    { value: true, label: gt`are flagged` },
    { value: false, label: gt`have no flag` },
  ];

  let tab = "messages";
  let words = quickSearch.bodyText ?? "";
  let isReadFiltered = booleanHasValue(quickSearch.isRead);
  let readValue = quickSearch.isRead ?? false;
  let isAttachmentFiltered = booleanHasValue(quickSearch.hasAttachment);
  let attachmentValue = quickSearch.hasAttachment ?? true;
  let isFlagFiltered = booleanHasValue(quickSearch.isStarred);
  let flagValue = quickSearch.isStarred ?? true;

  function clearAll() {
    words = "";
    isReadFiltered = false;
    isAttachmentFiltered = false;
    isFlagFiltered = false;
  }

  function save() {
    quickSearch.bodyText = words.trim() || null;
    quickSearch.isRead = isReadFiltered ? readValue : null;
    quickSearch.hasAttachment = isAttachmentFiltered ? attachmentValue : null;
    quickSearch.isStarred = isFlagFiltered ? flagValue : null;
  }
</script>

<style>
  .tab-page {
    min-height: 140px;
    padding-top: 16px;
  }
</style>
