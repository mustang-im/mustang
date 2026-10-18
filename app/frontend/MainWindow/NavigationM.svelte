<hbox bind:this={eventTargetE} />

<script lang="ts">
  import { showError } from "../Util/error";
  import { App } from "@capacitor/app";
  import { gestures } from "@composi/gestures";
  import { getNavigation } from "../AppsBar/selectedApp";

  const { goBack } = getNavigation();

  gestures();

  App.addListener("backButton", ({canGoBack}) => {
    if (canGoBack) {
      goBack();
    } else {
      App.minimizeApp();
    }
  });

  let eventTargetE: HTMLDivElement;
  App.addListener("appUrlOpen", ({url, iosSourceApplication, iosOpenInPlace}) => {
    try {
      let urlObj = new URL(url);
      let protocol = urlObj.protocol.replace(":", "");
      let urlEvent = new Event("url-" + protocol); // e.g. "url-mailto"
      (urlEvent as any).url = url;
      eventTargetE.dispatchEvent(urlEvent);
    } catch (ex) {
      showError(ex);
    }
  });
</script>
