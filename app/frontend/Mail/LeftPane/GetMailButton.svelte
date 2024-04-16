<hbox class="get-mail">
  <RoundButton
    label="Get mail"
    icon={DownloadIcon} classes="small"
    iconSize="12px"
    padding="0px"
    disabled={!account}
    on:click={() => catchErrors(getMail)}
    />
</hbox>

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import DownloadIcon from "lucide-svelte/icons/download";
  import { catchErrors } from "../../Util/error";
  import { selectedFolder } from "../Selected";
  import { SpecialFolder } from "../../../logic/Mail/Folder";

  export let account: MailAccount; /* in/out */

  async function getMail() {
    if (!account.isLoggedIn) {
      await account.login(true);
    }
    let folder = $selectedFolder ?? account.getSpecialFolder(SpecialFolder.Inbox);
    await folder.listMessages();
  }
</script>

<style>
  .get-mail {
    height: 22px;
  }
</style>
