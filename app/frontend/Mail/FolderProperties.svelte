<!--
SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>

SPDX-License-Identifier: EUPL-1.2
-->

{#if folder}
  <HeaderGroupBox>
    <hbox slot="header">{$folder.name}</hbox>
    <hbox slot="buttons-top-right">
      <Button label={$t`Delete folder`}
        classes="delete"
        iconOnly
        icon={DeleteIcon}
        onClick={onDelete}
        disabled={$folder.disableDelete()}
        />
    </hbox>
    <FolderGeneral {folder} />
    <hbox flex class="gap" />
    <FolderActions {folder} />
  </HeaderGroupBox>
{/if}

<script lang="ts">
  import type { Folder } from "../../logic/Mail/Folder";
  import FolderGeneral from "../Settings/Mail/Account/FolderGeneral.svelte";
  import FolderActions from "../Settings/Mail/Account/FolderActions.svelte";
  import Button from "../Shared/Button.svelte";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import { t } from "../../l10n/l10n";
  import HeaderGroupBox from "../Shared/HeaderGroupBox.svelte";

  export let folder: Folder;

  async function onDelete() {
    let confirmed = confirm($t`Are you sure that you want to the delete folder ${folder.name} and all messages in it? This will also delete it on the server.`);
    if (!confirmed) {
      return;
    }
    await folder.deleteIt();
  }
</script>

<style>
  .gap {
    min-height: 64px;
  }
</style>
