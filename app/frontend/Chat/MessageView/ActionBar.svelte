<!-- svelte-ignore a11y_no_static_element_interactions -->
<hbox class="reaction bar">
  <RoundButton
    label={$t`Copy`}
    icon={hasCopied ? CheckIcon : CopyIcon}
    onClick={onCopy}
    border={false} classes="plain"
    padding="4px"
    />
  {#if message.outgoing}
    <RoundButton
      label={$t`Edit`}
      icon={EditIcon}
      onClick={onEdit}
      border={false} classes="plain"
      padding="4px"
      />
    <ButtonMenu bind:isMenuOpen={isDeleteMenuOpen}>
      <RoundButton
        label={$t`Delete`}
        icon={TrashIcon}
        onClick={() => isDeleteMenuOpen = !isDeleteMenuOpen}
        border={false} classes="plain"
        padding="4px"
        slot="control"
        />
      <MenuItem
        label={$t`Delete for myself`}
        icon={TrashIcon}
        onClick={onDelete}
        />
      <MenuItem
        label={$t`Delete for everybody`}
        icon={TrashIcon}
        onClick={onDelete}
        />
    </ButtonMenu>
  {/if}
  <RoundButton
    label={$t`Reply`}
    icon={ReplyIcon}
    onClick={onReply}
    border={false} classes="plain"
    padding="4px"
    />
  <RoundButton
    label={$t`Forward`}
    icon={ForwardIcon}
    onClick={onForward}
    border={false} classes="plain"
    padding="4px"
    />
</hbox>

<script lang="ts">
  import { t } from "../../../l10n/l10n";
  import { Message } from "../../../logic/Abstract/Message";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import Toolbar from "../../Shared/Toolbar/Toolbar.svelte";
  import TrashIcon from "lucide-svelte/icons/trash-2";
  import EditIcon from "lucide-svelte/icons/pencil";
  import ReplyIcon from "lucide-svelte/icons/reply";
  import ForwardIcon from "lucide-svelte/icons/forward";
  import CopyIcon from "lucide-svelte/icons/copy";
  import CheckIcon from "lucide-svelte/icons/check";
  import ShareIcon from "lucide-svelte/icons/trash-2";
  import { sleep } from "../../../logic/util/util";
  import ButtonMenu from "../../Shared/Menu/ButtonMenu.svelte";
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";

  export let message: Message;

  let isDeleteMenuOpen = false;
  async function onDelete() {
    await message.deleteMessage();
  }
  async function onEdit() {
  }
  async function onReply() {
  }
  async function onForward() {
  }

  let hasCopied = false;
  async function onCopy() {
    navigator.clipboard.writeText(message.text);
    hasCopied = true;
    await sleep(1);
    hasCopied = false
  }
</script>

<style>
  .bar {
    border-radius: 10px;
  }
</style>
