<div>
  <T msg={`You can find the source code of ${appName} core at # under an #.`}>
    <!-- Slot 1 doesn't need explicit declaration `slot="1"`, it breaks the code. -->
    <a href="https://github.com/mustang-im/mustang" target="_blank">GitHub</a>
    <!-- Slot 2 -->
    <a href="https://raw.githubusercontent.com/mustang-im/mustang/master/LICENSE" target="_blank" slot="2">{$t`Open-Source license`}</a>
  </T>
</div>
<div>
 {$t`${appName} is built using the following Open-Source components. We sincerely thank those authors and contributors.`}
</div>

<iframe 
  src={attributionURL}
  title="Licenses" sandbox=""
  bind:this={iframeE}
/>

<script lang="ts">
  import { appName } from "../../../logic/build";
  import { t } from "../../../l10n/l10n";
  import T from '../../../l10n/T.svelte';
  import { fetchGzip } from "../../Util/util";
  import { onMount } from "svelte";
  import attributionURL from "../../../public/attribution.txt.gz?url";

  let iframeE: HTMLIFrameElement;

  onMount(async () => {
    iframeE.src = await fetchGzip(iframeE.src);
  });
</script>

<style>
  iframe {
    flex: 1 0 0;
    border: none;
    margin-block-start: 32px;
  }
</style>
