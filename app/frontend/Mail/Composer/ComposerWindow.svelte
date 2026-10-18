<PopoutWindow title={$mail.subject || $t`New mail`}>
  <MailComposer {mail} />
</PopoutWindow>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import PopoutWindow from "../../MainWindow/PopoutWindow.svelte";
  import MailComposer from "./MailComposer.svelte";
  import { t } from "../../../l10n/l10n";

  export let mail: EMail;
</script>
