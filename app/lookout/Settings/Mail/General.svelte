<OptionsPage icon={MailIcon} description={$t`Change the settings for messages you create and receive.`}>
  <OptionsSection title={$t`Compose messages`}>
    <OptionsRow icon={ComposeIcon}>
      <hbox>{$t`Change the editing settings for messages.`}</hbox>
      <hbox class="field-row">
        <label for="options-compose-format">{$t`Compose messages in this format:`}</label>
        <ComboBox options={[ { value: "html", label: $t`HTML` }, { value: "plaintext", label: $t`Plain Text` } ]}
          bind:value={options.composeFormat.value} label={$t`Compose messages in this format`} width="200px" />
      </hbox>
    </OptionsRow>
    <OptionsRow icon={SpellingIcon}>
      <CheckBox label={$t`Check spelling as you type`} bind:checked={options.spellcheck.value} />
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
      <CheckBox label={$t`Play a sound`} bind:checked={options.newMailSound.value} />
      <CheckBox label={$t`Display a Desktop Alert`} bind:checked={options.newMailAlert.value} />
      <CheckBox label={$t`Only for messages from people in my contacts`} bind:checked={options.newMailOnlyFromContacts.value}
        disabled={!options.newMailSound.value && !options.newMailAlert.value} />
    </OptionsRow>
  </OptionsSection>

  <OptionsSection title={$t`Replies and forwards`}>
    <OptionsRow icon={ReplyIcon}>
      <CheckBox label={$t`Open replies and forwards in a new window`} bind:checked={options.repliesInNewWindow.value} />
      <grid class="replies">
        <label for="options-reply">{$t`When replying to a message:`}</label>
        <ComboBox options={[
            { value: "below", label: $t`Include original message text` },
            { value: "above", label: $t`Include original message text, reply below it` },
            { value: "none", label: $t`Do not include original message` },
          ]}
          bind:value={options.replyQuote.value} label={$t`When replying to a message`} width="320px" />
        <label for="options-forward">{$t`When forwarding a message:`}</label>
        <ComboBox options={[ { value: "inline", label: $t`Include original message text` }, { value: "attachment", label: $t`Attach original message` } ]}
          bind:value={options.forwardMode.value} label={$t`When forwarding a message`} width="320px" />
      </grid>
    </OptionsRow>
  </OptionsSection>
</OptionsPage>

{#if isReadingPaneOpen}
  <ReadingPaneOptionsDialog on:close={() => isReadingPaneOpen = false} />
{/if}

<script lang="ts">
  import ComboBox from "../../Shared/Form/ComboBox.svelte";
  import CheckBox from "../../Shared/Form/CheckBox.svelte";
  import type { OptionsModel } from "../Window/OptionsModel";
  import OptionsPage from "../Shared/OptionsPage.svelte";
  import OptionsSection from "../Shared/OptionsSection.svelte";
  import OptionsRow from "../Shared/OptionsRow.svelte";
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
