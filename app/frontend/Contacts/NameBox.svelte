<GroupBox classes="person">
  <hbox flex class="main-left" slot="content" language={getUILocale()}>
    <hbox flex>
      <PersonPicture {person} size={64} allowPlaceholder={true} />
      <vbox class="main-info">
        <hbox class="name">
          <EditableSimpleText bind:value={person.name}
            on:save={save}
            bind:isEditing={isEditingName}
            isName={true}
            placeholder={$t`First name Last name`} />
        </hbox>
        {#if isEditingName}
          <hbox class="names firstname">
            <EditableSimpleText
              bind:value={person.firstName}
              on:save={save}
              bind:isEditing={isEditingName}
              placeholder={$t`First name`} />
          </hbox>
          <hbox class="names lastname">
            <EditableSimpleText
              bind:value={person.lastName}
              on:save={save}
              bind:isEditing={isEditingName}
              placeholder={$t`Last name`} />
          </hbox>
        {/if}
        <vbox class="job-company">
          {#if $person.position || isEditingName}
            <hbox class="position">
              <EditableSimpleText
                bind:value={person.position}
                on:save={save}
                bind:isEditing={isEditingName}
                placeholder={$t`Position`} />
            </hbox>
          {/if}
          {#if $person.department || isEditingName}
            <hbox class="department">
              <EditableSimpleText
                bind:value={person.department}
                on:save={save}
                bind:isEditing={isEditingName}
                placeholder={$t`Department`} />
            </hbox>
          {/if}
          {#if $person.company || isEditingName}
            <hbox class="company">
              <EditableSimpleText
                bind:value={person.company}
                on:save={save}
                bind:isEditing={isEditingName}
                placeholder={$t`Company`} />
            </hbox>
          {/if}
        </vbox>
      </vbox>
    </hbox>
    <hbox flex class="main-right">
      <hbox class="main-call">
        {#if preferredVideoCall}
          <RoundButton
            label={$t`Video call`}
            icon={CameraIcon}
            classes="large secondary plain action"
            border={false}
            onClick={() => startVideoCall(person)} />
        {/if}
        {#if preferredPhoneNumber}
          <a href="tel:{preferredPhoneNumber}" class="phone-call">
            <RoundButton
              label={$t`Call`}
              icon={CallIcon}
              iconSize="19px"
              border={false}
              classes="large secondary plain action" />
          </a>
        {/if}
        {#if preferredChatAccount}
          <RoundButton
            label={$t`Message`}
            icon={ChatIcon}
            border={false}
            classes="large secondary plain action" />
        {/if}
        {#if preferredEmailAddress}
          <a href="mailto:{preferredEmailAddress}">
            <RoundButton
              label={$t`Send mail`}
              icon={MailIcon}
              border={false}
              classes="large secondary plain action" />
          </a>
        {/if}
      </hbox>
      <hbox flex />
      <hbox class="main-right-top">
        <AddressbookChanger {person} />
        <PersonMenu {person} />
      </hbox>
    </hbox>
  </hbox>
</GroupBox>

<script lang="ts">
  import type { Person } from "../../logic/Abstract/Person";
  import { startVideoCall } from "../../logic/Meet/StartCall";
  import EditableSimpleText from "./EditableSimpleText.svelte";
  import GroupBox from "./GroupBox.svelte";
  import PersonMenu from "./PersonMenu.svelte";
  import PersonPicture from "./Person/PersonPicture.svelte";
  import AddressbookChanger from "./AddressbookChanger.svelte";
  import RoundButton from "../Shared/RoundButton.svelte";
  import MailIcon from '../asset/icon/appBar/mail.svg?raw';
  import ChatIcon from '../asset/icon/appBar/chat.svg?raw';
  import CameraIcon from '../asset/icon/appBar/meet.svg?raw';
  import CallIcon from '../asset/icon/meet/callVoice.svg?raw';
  import { showError } from "../Util/error";
  import { getUILocale, t } from "../../l10n/l10n";

  export let person: Person;

  $: emailAddresses = person.emailAddresses;
  $: phoneNumbers = person.phoneNumbers;
  $: chatAccounts = person.chatAccounts;
  $: preferredPhoneNumber = $phoneNumbers.isEmpty ? null :
      $phoneNumbers.sortBy(p => p.preference).first?.value;
  $: preferredEmailAddress = $emailAddresses.isEmpty ? null :
      $emailAddresses.sortBy(p => p.preference).first?.value;
  $: preferredVideoCall = null;
  $: preferredChatAccount = $chatAccounts.isEmpty ? null :
      $chatAccounts.sortBy(p => p.preference).first?.value;

  let isEditingName: boolean;

  async function save() {
    try {
      await person.save();
    } catch (ex) {
      showError(ex);
    }
  }
</script>

<style>
  .main-left {
    margin-inline-start: -16px;
    margin-inline-end: -8px;
    margin-block-end: -8px;
  }
  .main-info {
    margin-inline-start: 12px;
    margin-block-start: 16px;
    margin-block-end: 16px;
  }
  .name,
  .name :global(input) {
    font-size: 18px;
    font-weight: bold;
    margin-block-end: 8px;
    color: inherit;
  }
  .name :global(input) {
    width: 20em;
  }
  .names :global(button.save),
  .job-company :global(button.save) {
    visibility: hidden;
  }
  .main-left[language="fr"] .names.lastname {
    text-transform: uppercase;
  }
  .job-company {
    color: grey;
  }
  .job-company :global(.actions),
  .job-company :global(.value) {
    margin-block-start: 2px;
  }
  .main-right {
    margin: 8px;
    flex-wrap: wrap;
  }
  .main-call {
    align-items: start;
    margin-block-start: 8px;
    margin-inline-end: 10px;
  }
  .main-call :global(> *) {
    margin-inline-end: 10px;
  }
  .main-right-top {
    justify-content: end;
    align-items: start;
    margin-block-start: px;
  }
  .main-right-top :global(.account-selector .icon) {
    width: 20px;
    height: 20px;
  }
  .preferred {
    margin-block-start: 8px;
    margin-block-end: 8px;
    font-size: 13px;
  }
  .phone-call :global(.icon) {
    /* because the icon is 1px smaller */
    margin: 1px;
  }
</style>
