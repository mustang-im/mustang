<OptionsPage icon={MailIcon} description={$t`Change the settings for messages you create and receive.`}>
  <OptionsSection title={$t`Compose messages`}>
    <OptionsRow icon={ComposeIcon}>
      <hbox>{$t`Change the editing settings for messages.`}</hbox>
      <hbox class="field-row">
        <label for="options-compose-format">{$t`Compose messages in this format:`}</label>
        <select id="options-compose-format" class="lo-text-field" bind:value={options.composeFormat.value}>
          <option value="html">{$t`HTML`}</option>
          <option value="plaintext">{$t`Plain Text`}</option>
        </select>
      </hbox>
    </OptionsRow>
    <OptionsRow icon={SpellingIcon}>
      <label>
        <input type="checkbox" bind:checked={options.spellcheck.value} />
        {$t`Check spelling as you type`}
      </label>
    </OptionsRow>
  </OptionsSection>

  <OptionsSection title={$t`${appName} panes`}>
    <OptionsRow icon={ReadingPaneIcon}>
      <hbox>{$t`Customize how items are marked as read when using the Reading Pane.`}</hbox>
      <DialogButton slot="button" label={$t`Reading Pane…`} onClick={() => { isReadingPaneOpen = true; }} />
    </OptionsRow>
  </OptionsSection>

  <OptionsSection title={$t`Message arrival`}>
    <OptionsRow icon={ArrivalIcon}>
      <hbox>{$t`When new messages arrive:`}</hbox>
      <label>
        <input type="checkbox" bind:checked={options.newMailSound.value} />
        {$t`Play a sound`}
      </label>
      <label>
        <input type="checkbox" bind:checked={options.newMailAlert.value} />
        {$t`Display a Desktop Alert`}
      </label>
      <label>
        <input type="checkbox" bind:checked={options.newMailOnlyFromContacts.value}
          disabled={!options.newMailSound.value && !options.newMailAlert.value} />
        {$t`Only for messages from people in my contacts`}
      </label>
    </OptionsRow>
  </OptionsSection>

  <OptionsSection title={$t`Replies and forwards`}>
    <OptionsRow icon={ReplyIcon}>
      <grid class="replies">
        <label for="options-reply">{$t`When replying to a message:`}</label>
        <select id="options-reply" class="lo-text-field" bind:value={options.replyQuote.value}>
          <option value="below">{$t`Include original message text`}</option>
          <option value="above">{$t`Include original message text, reply below it`}</option>
          <option value="none">{$t`Do not include original message`}</option>
        </select>
        <label for="options-forward">{$t`When forwarding a message:`}</label>
        <select id="options-forward" class="lo-text-field" bind:value={options.forwardMode.value}>
          <option value="inline">{$t`Include original message text`}</option>
          <option value="attachment">{$t`Attach original message`}</option>
        </select>
      </grid>
    </OptionsRow>
  </OptionsSection>
</OptionsPage>

{#if isReadingPaneOpen}
  <ReadingPaneOptionsDialog on:close={() => isReadingPaneOpen = false} />
{/if}

<script lang="ts">
  import type { OptionsModel } from "./OptionsModel";
  import OptionsPage from "./OptionsPage.svelte";
  import OptionsSection from "./OptionsSection.svelte";
  import OptionsRow from "./OptionsRow.svelte";
  import DialogButton from "../../Shared/Dialog/DialogButton.svelte";
  import ReadingPaneOptionsDialog from "../../Mail/Dialogs/ReadingPaneOptionsDialog.svelte";
  import MailIcon from "lucide-svelte/icons/mail";
  import ComposeIcon from "lucide-svelte/icons/file-pen-line";
  import SpellingIcon from "lucide-svelte/icons/spell-check";
  import ReadingPaneIcon from "lucide-svelte/icons/panel-right";
  import ArrivalIcon from "lucide-svelte/icons/bell";
  import ReplyIcon from "lucide-svelte/icons/reply";
  import { appName } from "../../../logic/build";
  import { t } from "../../../l10n/l10n";

  export let options: OptionsModel;

  let isReadingPaneOpen = false;
</script>

<style>
  grid.replies {
    display: grid;
    grid-template-columns: max-content minmax(200px, 320px);
    align-items: center;
    gap: 8px 12px;
  }
</style>
