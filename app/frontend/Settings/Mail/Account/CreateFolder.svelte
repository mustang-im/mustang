<vbox class="create-folder">
  <HeaderGroupBox>
    <hbox slot="header">{$t`Create folder`}</hbox>
    <vbox class="content">
      <grid>
        <label for="name">{$t`Folder name`}</label>
        <input type="text" bind:value={name} name="name" autofocus />

        <label for="name">{$t`Located`}</label>
        <hbox class="radiogroup">
          <input type="radio" value="subfolder" id="subfolder" bind:group={location} disabled={isSubfolderDisabled} />
          <label for="subfolder" class:disabled={isSubfolderDisabled}>{$t`Subfolder of ${parentFolder.name}`}</label>
          <input type="radio" value="toplevel" id="toplevel" bind:group={location} />
          <label for="toplevel">{$t`Top-level, like Inbox`}</label>
        </hbox>
      </grid>
    </vbox>

    <hbox class="buttons">
      <Button label={$t`Cancel`}
        classes="cancel"
        icon={CancelIcon}
        onClick={onCancel}
        />
      <Button label={$t`Create folder`}
        classes="save"
        icon={CreateIcon}
        onClick={onCreate}
        disabled={!name}
        />
    </hbox>
  </HeaderGroupBox>
</vbox>

<script lang="ts">
  import { Folder, SpecialFolder } from "../../../../logic/Mail/Folder";
  import HeaderGroupBox from "../../../Shared/HeaderGroupBox.svelte";
  import Button from "../../../Shared/Button.svelte";
  import CreateIcon from "lucide-svelte/icons/save";
  import CancelIcon from "lucide-svelte/icons/circle-x";
  import { t } from "../../../../l10n/l10n";
  import { createEventDispatcher } from 'svelte';
  const dispatchEvent = createEventDispatcher<{ close: void }>();

  export let parentFolder: Folder;
  export let location: "subfolder" | "toplevel" = "subfolder";

  let name = "";
  let isSubfolderDisabled = false;

  $: parentFolder, init()
  function init() {
    isSubfolderDisabled = parentFolder.specialFolder == SpecialFolder.Inbox ||
      !!parentFolder?.disableSubfolders();
    if (isSubfolderDisabled) {
      location = "toplevel";
    }
  }

  async function onCreate() {
    if (location == "subfolder") {
      await parentFolder.createSubFolder(name);
    } else {
      await parentFolder.account.createToplevelFolder(name);
    }
    dispatchEvent("close");
  }

  function onCancel() {
    dispatchEvent("close");
  }
</script>

<style>
  .create-folder {
    max-width: 40em;
  }
  grid {
    grid-template-columns: max-content auto;
    gap: 8px 24px;
  }
  .radiogroup {
    align-items: center;
  }
  .radiogroup input {
    margin-bottom: 2px;
  }
  .radiogroup label {
    margin-left: 3px;
    margin-right: 24px;
  }
  label.disabled {
    opacity: 50%;
  }
  .buttons {
    justify-content: end;
    margin-block-start: 64px;
  }
  .buttons :global(button) {
    margin-inline-start: 8px;
  }
</style>
