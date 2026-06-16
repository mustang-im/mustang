<!-- svelte-ignore a11y_no_static_element_interactions -->
{#if showAll}
  <hbox class="reaction popup">
    <EmojiSelector {searchTerm} on:select={ev => catchErrors(() => onAdd(ev.detail.emoji))} />
  </hbox>
{:else}
  <hbox class="reaction bar">
    {#each recent as emoji}
      <RoundButton
        label={emoji}
        onClick={() => onAdd(emoji)}
        border={false} classes="plain"
        padding="0px"
        >
        <hbox class="icon font-large" slot="icon">
          {emoji}
        </hbox>
      </RoundButton>
    {/each}
    <RoundButton
      label={$t`Show more emojis`}
      onClick={() => showAll = !showAll}
      icon={MoreIcon}
      border={false} classes="plain"
      padding="4px"
      />
  </hbox>
{/if}

<script lang="ts">
  import { Message } from "../../../logic/Abstract/Message";
  import EmojiSelector from "../Emoji/EmojiSelector.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import MoreIcon from "lucide-svelte/icons/ellipsis-vertical";
  import { catchErrors } from "../../Util/error";
  import { t } from "../../../l10n/l10n";

  export let message: Message;
  /** in/out */
  export let isOpen: boolean;

  let recent = ["😊", "🤣", "😍", "🤪", "🫣"];
  let showAll = false;
  let searchTerm: string;

  async function onAdd(emoji: string) {
    await message.setReaction(emoji);
    isOpen = false;
  }
</script>

<style>
  .bar,
  .popup {
    border-radius: 10px;
  }
  .popup {
    min-height: 300px;
    min-width: 400px;
    padding: 6px 0px;
  }
</style>
