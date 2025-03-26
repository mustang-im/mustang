<hbox class="online-meeting">
  <a href={$event.onlineMeetingURL} target="_blank">
    {getOnlineServiceLabel($event.onlineMeetingURL)}
  </a>
  <hbox class="buttons">
    <Button
      label={$t`Copy`}
      icon={CopyIcon}
      iconSize="16px"
      iconOnly
      plain
      on:click={onCopyMeetingURL}
      />
    <a href={$event.onlineMeetingURL} target="_blank" class="link-button">
      <Button
        label={$t`Open`}
        icon={BrowserIcon}
        iconSize="16px"
        iconOnly
        plain
        />
    </a>
  </hbox>
</hbox>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import Button from "../../Shared/Button.svelte";
  import CopyIcon from "lucide-svelte/icons/copy";
  import BrowserIcon from "lucide-svelte/icons/globe";
  import { getBaseDomainFromURL } from "../../../logic/util/netUtil";
  import type { URLString } from "../../../logic/util/util";
  import { t, gt } from "../../../l10n/l10n";

  export let event: Event;

  function getOnlineServiceLabel(url: URLString) {
    let domain: string;
    let hostname: string;
    try {
      domain = getBaseDomainFromURL(url);
      hostname = new URL(url).hostname;
    } catch (ex) {
      return gt`Broken meeting link`;
    }
    if (hostname == "teams.microsoft.com") {
      return "Microsoft Teams";
    } else if (domain == "zoom.us" || domain == "zoom.com") {
      return "Zoom";
    } else if (domain == "webex.com") {
      return "Cisco Webex";
    } else if (domain == "parula.app" || domain == "beonex.com") {
      return gt`${"Parula"} online meeting`;
    } else if (domain == "mustang.im") {
      return gt`${"Mustang"} online meeting`;
    } else {
      return gt`Online meeting` + " " + domain;
    }
  }

  function onCopyMeetingURL() {
    navigator.clipboard.writeText(event.onlineMeetingURL);
  }
</script>

<style>
  .online-meeting .buttons {
    margin-inline-start: 4px;
  }
  .link-button {
    display: flex;
  }
</style>
