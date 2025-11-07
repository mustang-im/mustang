<hbox class="call-buttons">
  {#if preferredVideoCall}
    <RoundButton
      label={$t`Video call`}
      icon={CameraIcon}
      classes="large secondary action"
      onClick={() => startVideoCall(person)} />
  {/if}
  {#if preferredPhoneNumber}
    <a href="tel:{preferredPhoneNumber}" class="phone-call">
      <RoundButton
        label={$t`Call`}
        icon={CallIcon}
        iconSize="19px"
        classes="large secondary action" />
    </a>
  {/if}
  {#if preferredChatAccount}
    <RoundButton
      label={$t`Message`}
      icon={ChatIcon}
      classes="large secondary action" />
  {/if}
  {#if preferredEmailAddress}
    <a href="mailto:{preferredEmailAddress}">
      <RoundButton
        label={$t`Send mail`}
        icon={MailIcon}
        classes="large secondary action" />
    </a>
  {/if}
</hbox>

<script lang="ts">
  import type { Person } from "../../../logic/Abstract/Person";
  import { startVideoCall } from "../../../logic/Meet/StartCall";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import MailIcon from '../../asset/icon/appBar/mail.svg?raw';
  import ChatIcon from '../../asset/icon/appBar/chat.svg?raw';
  import CameraIcon from '../../asset/icon/appBar/meet.svg?raw';
  import CallIcon from '../../asset/icon/meet/callVoice.svg?raw';
  import { t } from "../../../l10n/l10n";

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
</script>

<style>
  .call-buttons :global(> *) {
    margin-inline-end: 10px;
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
