<StatusMessage status="success"
  message="Your email account is working and ready to be used.">
  <CheckIcon slot="icon"/>
</StatusMessage>

<WorkspaceSelector {config} />

<script lang="ts">
  import type { MailAccount } from "../../../../logic/Mail/MailAccount";
  import WorkspaceSelector from "./WorkspaceSelector.svelte";
  import StatusMessage from "../StatusMessage.svelte";
  import CheckIcon from "lucide-svelte/icons/check";

  export let config: MailAccount;
</script>

<style>
</style>
