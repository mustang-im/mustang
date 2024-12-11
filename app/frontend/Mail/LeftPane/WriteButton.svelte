<!--
SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>

SPDX-License-Identifier: EUPL-1.2
-->

<RoundButton
  label={$t`Write new email`}
  icon={WriteIcon} classes="create"
  disabled={!selectedAccount}
  onClick={newMail}
  />

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import { mailMustangApp } from "../MailMustangApp";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import WriteIcon from "lucide-svelte/icons/pencil";
  import { t } from "../../../l10n/l10n";

  export let selectedAccount: MailAccount; /* in/out */

  function newMail() {
    let email = selectedAccount.newEMailFrom();
    mailMustangApp.writeMail(email);
  }
</script>
