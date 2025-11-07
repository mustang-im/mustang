<vbox class="main font-normal" language={getUILocale()} flex>
  <hbox class="avatar-row" flex>
    <hbox class="top-left buttons" flex>
      {#if isIOS}
        <RoundButton
          icon={BackIcon}
          label={$t`Back to persons list`}
          onClick={() => navigate(-1)}
          classes="back" />
      {/if}
      {#if isEditingName}
        <hbox class="addressbook-edit">
          <AddressbookChanger {person} withLabel={true} />
        </hbox>
      {/if}
    </hbox>
    <vbox class="avatar" class:no-avatar={!person.picture}>
      {#if person.picture || isEditingName}
        <PersonPicture {person} size={person.picture ? 64 : 32} placeholder="icon" />
      {/if}
    </vbox>
    <hbox class="top-right buttons" flex>
      {#if isEditingName}
        <Button
          icon={SaveIcon}
          label={$t`Save`}
          onClick={onSave}
          classes="save primary filled" />
      {:else}
        <RoundButton
          icon={person.addressbook?.icon ?? AddressbookIcon}
          label={person.addressbook?.name}
          disabled={true}
          padding="0px"
          classes="addressbook-display plain" border={false} />
        <Button
          icon={EditIcon}
          label={$t`Edit`}
          onClick={onEdit}
          classes="edit primary" plain={true} />
      {/if}
    </hbox>
  </hbox>
  <vbox class="main-info" flex>
    {#if isEditingName}
      <GroupBox>
        <vbox class="names-edit-box" slot="content">
          <hbox class="name">
            <EditableSimpleText bind:value={person.name}
              on:save={onSaveWithCatch}
              bind:isEditing={isEditingName}
              isName={true}
              placeholder={$t`First name Last name`} />
          </hbox>
          <hbox class="names firstname">
            <EditableSimpleText
              bind:value={person.firstName}
              on:save={onSaveWithCatch}
              bind:isEditing={isEditingName}
              placeholder={$t`First name`} />
          </hbox>
          <hbox class="names lastname">
            <EditableSimpleText
              bind:value={person.lastName}
              on:save={onSaveWithCatch}
              bind:isEditing={isEditingName}
              placeholder={$t`Last name`} />
          </hbox>
        </vbox>
      </GroupBox>
    {:else}
      <hbox class="name center">
        <EditableSimpleText bind:value={person.name}
          on:save={onSaveWithCatch}
          bind:isEditing={isEditingName}
          isName={true}
          placeholder={$t`First name Last name`} />
      </hbox>
    {/if}
  </vbox>
  {#if !isEditingName}
    <hbox class="center" flex>
      <CallButtons {person} />
    </hbox>
  {/if}
</vbox>
{#if showCompany || showCompanyEdit}
    <CompanyBox {person} isEditing={isEditingName} />
{:else if isEditingName}
  <hbox class="company-expander">
    <ExpanderButtons>
      <ExpanderButton bind:expanded={showCompanyEdit}
        label={$t`Company`} icon={CompanyIcon} classes="company" />
    </ExpanderButtons>
  </hbox>
{/if}

<script lang="ts">
  import type { Person } from "../../../logic/Abstract/Person";
  import CallButtons from "./CallButtons.svelte";
  import EditableSimpleText from "./EditableSimpleText.svelte";
  import PersonPicture from "../Person/PersonPicture.svelte";
  import CompanyBox from "./CompanyBox.svelte";
  import AddressbookChanger from "../AddressbookChanger.svelte";
  import ExpanderButtons from "../../Shared/ExpanderButtons.svelte";
  import ExpanderButton from "../../Shared/ExpanderButton.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import EditIcon from "lucide-svelte/icons/pencil";
  import SaveIcon from "lucide-svelte/icons/check";
  import AddressbookIcon from "lucide-svelte/icons/book-user";
  import CompanyIcon from "lucide-svelte/icons/building-2";
  import BackIcon from "lucide-svelte/icons/chevron-left";
  import { showError } from "../../Util/error";
  import { getUILocale, t } from "../../../l10n/l10n";
  import Button from "../../Shared/Button.svelte";
  import GroupBox from "./GroupBox.svelte";
  import { navigate } from "svelte-navigator";

  export let person: Person;
  /** in/out */
  export let isEditingName: boolean;

  $: showCompany = $person.company || $person.position || $person.department ? true : false;
  let showCompanyEdit = false;
  $: !isEditingName && (showCompanyEdit = false);
  let isIOS = true;

  function onEdit() {
    isEditingName = true;
  }
  async function onSave() {
    isEditingName = false;
    await person.save();
  }
  async function onSaveWithCatch() {
    try {
      await onSave();
    } catch (ex) {
      showError(ex);
    }
  }
</script>

<style>
  .avatar.no-avatar {
    margin-block-start: 72px;
  }
  .buttons {
    align-items: start;
    margin: 12px 12px;
  }
  .top-left {
    justify-content: start;
  }
  .top-right {
    justify-content: end;
  }
  .top-left :global(> *) {
    margin-inline-end: 8px;
  }
  .top-right :global(> *) {
    margin-inline-start: 8px;
  }
  .top-right :global(> .edit) {
    margin-block-start: -12px;
    padding-block: 12px;
  }
  .addressbook-edit {
    margin-block-start: 6px;
    margin-inline-start: 8px;
  }
  .top-right :global(.account-selector .icon) {
    width: 20px;
    height: 20px;
  }
  .main-info {
    justify-content: center;
    margin-inline-start: 12px;
    margin-block-end: 8px;
  }
  .center {
    justify-content: center;
  }
  .name :global(.value) {
    font-size: 32px;
  }
  .name,
  .name :global(input) {
    font-weight: bold;
    color: inherit;
  }
  .names-edit-box {
    margin-inline-end: 8px;
    margin-block-end: 8px;
  }
  .names :global(button.save) {
    visibility: hidden;
  }
  .main[language="fr"] .names.lastname {
    text-transform: uppercase;
  }
  .company-expander {
    justify-content: end;
  }
</style>
