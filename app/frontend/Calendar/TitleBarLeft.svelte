<!--
SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>

SPDX-License-Identifier: EUPL-1.2
-->

<hbox class="title-bar">
  <RoundButton classes="add-button create" label={$t`New event`} icon={AddToCalendarIcon} on:click={addEvent} iconSize="22px" padding="6px" />
</hbox>

<script lang="ts">
  import { selectedCalendar, type DateInterval } from "./selected";
  import AccountSelectorRound from "../Shared/AccountSelectorRound.svelte";
  import RoundButton from "../Shared/RoundButton.svelte";
  import CalendarIcon from "lucide-svelte/icons/calendar";
  import AddToCalendarIcon from "lucide-svelte/icons/plus";
  import { createEventDispatcher } from 'svelte';
  import { appGlobal } from "../../logic/app";
  import { t } from "../../l10n/l10n";

  const dispatch = createEventDispatcher();

  function addEvent() {
    dispatch('addEvent');
  }
</script>

<style>
  .title-bar {
    align-items: center;
    justify-content: center;
    margin: 4px;
  }
  .title-bar :global(.calendar-selector) {
    margin-inline-end: 16px;
  }
  .title-bar :global(.account button) {
    padding: 8px;
  }
  .title-bar :global(.account .icon svg) {
    height: 20px;
    width: 20px;
  }
  .title-bar :global(.add-button) {
    margin: 4px;
    align-items: center;
    justify-content: center;
    position: relative;
  }
</style>
