<StatusMessage status="success"
  message="Your email account is working and ready to be used.">
  <CheckIcon slot="icon"/>
</StatusMessage>

<WorkspaceSelector selectedWorkspace={workspace} />

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import WorkspaceSelector from "./WorkspaceSelector.svelte";
  import StatusMessage from "./StatusMessage.svelte";
  import CheckIcon from "lucide-svelte/icons/check";

  export let config: MailAccount;

  let workspace: string;
</script>

<style>
</style>
