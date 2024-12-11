<!--
SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>

SPDX-License-Identifier: EUPL-1.2
-->

<hbox class="persons-toolbar">
  <AccountDropDown bind:selectedAccount accounts={appGlobal.chatAccounts} />
  <hbox flex />
  <hbox class="buttons">
    <RoundButton label={$t`New group`} icon={NewGroupIcon} iconSize="22px" padding="9px" classes="large create" on:click={() => catchErrors(addGroup)} />
  </hbox>
</hbox>

<script lang="ts">
  import type { ChatAccount } from "../../logic/Chat/ChatAccount";
  import { appGlobal } from "../../logic/app";
  import AccountDropDown from "../Shared/AccountDropDown.svelte";
  import RoundButton from "../Shared/RoundButton.svelte";
  import NewGroupIcon from "lucide-svelte/icons/plus";
  import { catchErrors } from "../Util/error";
  import { NotImplemented } from "../../logic/util/util";
  import { t } from "../../l10n/l10n";

  let selectedAccount: ChatAccount;

  function addGroup() {
    throw new NotImplemented("Creating chat groups is not yet implemented");
  }
</script>

<style>
  .persons-toolbar {
    margin: 10px 12px 10px 16px;
    align-items: center;
  }
</style>
