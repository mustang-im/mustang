<!--
SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>

SPDX-License-Identifier: EUPL-1.2
-->

{#if meeting}
  <InMeeting {meeting} isSidebar={true} />
{/if}

<script lang="ts">
  import { appGlobal } from "../../logic/app";
  import InMeeting from "./InMeeting.svelte";

  $: meetings = appGlobal.meetings;
  $: meeting = $meetings.first;
</script>

<style>
</style>
