<script lang="ts">
  import { SettingsDialogs } from "../Settings/SettingsDialogs";
  import type { MailAccount } from "../../logic/Mail/MailAccount";
  import { onMount } from "svelte";

  export let account: MailAccount | null = null;

  onMount(() => SettingsDialogs.openFirstRun(account));
</script>
