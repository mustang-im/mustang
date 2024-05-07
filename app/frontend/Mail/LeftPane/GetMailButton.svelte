<hbox class="get-mail {status}">
  <RoundButton
    label="Get mail"
    icon={
      status == Status.Fetching ? FetchingIcon :
      status == Status.New ? NewIcon :
      status == Status.Error ? ErrorIcon :
      status == Status.Done ? DoneIcon :
      status == Status.Login ? LoginIcon :
      DownloadIcon
      }
    classes="small"
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
  import FetchingIcon from "lucide-svelte/icons/arrow-big-down-dash";
  import DoneIcon from "lucide-svelte/icons/check";
  import NewIcon from "lucide-svelte/icons/sparkle";
  import LoginIcon from "lucide-svelte/icons/key-round";
  import ErrorIcon from "lucide-svelte/icons/server-crash";
  import { catchErrors, showError } from "../../Util/error";
  import { selectedFolder } from "../Selected";
  import { SpecialFolder } from "../../../logic/Mail/Folder";
  import { sleep } from "../../../logic/util/util";

  export let account: MailAccount; /* in/out */

  enum Status {
    Waiting = "waiting",
    Login = "login",
    Fetching = "fetching",
    New = "new",
    Error = "error",
    Done = "done",
  };
  let status = Status.Waiting;

  async function getMail() {
    try {
      if (status != Status.Waiting) {
        return;
      }
      if (!account.isLoggedIn) {
        status = Status.Login;
        await account.login(true);
      }
      let folder = $selectedFolder ?? account.getSpecialFolder(SpecialFolder.Inbox);
      status = Status.Fetching;
      await folder.listMessages();
      await folder.downloadAllMessages();
      status = folder.countNewArrived ? Status.New : Status.Done;
      await sleep(2);
      status = Status.Waiting;
    } catch (ex) {
      showError(ex);
      status = Status.Error;
      await sleep(2);
      status = Status.Done;
    }
  }
</script>

<style>
  .get-mail {
    height: 22px;
  }
  .get-mail.new :global(svg) {
    color: orange;
    stroke-width: 3px;
  }
  .get-mail.done :global(svg) {
    color: green;
    stroke-width: 4px;
  }
  .get-mail.fetching :global(svg) {
    stroke-width: 2px;
    animation: down 1.5s ease 0s infinite normal ;
  }
  @keyframes down {
    0% {
      transform: translateY(-3px);
    }
    80% {
      transform: translateY(3px);
    }
    100% {
      transform: translateY(-3px);
    }
  }
</style>
