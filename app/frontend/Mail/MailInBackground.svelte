<!--
SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>

SPDX-License-Identifier: EUPL-1.2
-->

<script lang="ts">
  import { newMailListener } from "./NotifyNewMail";
  import { appGlobal } from "../../logic/app";
  import { catchErrors } from "../Util/error";

  $: emailAccounts = appGlobal.emailAccounts;
  $: catchErrors(() => newMailListener($emailAccounts));
</script>
