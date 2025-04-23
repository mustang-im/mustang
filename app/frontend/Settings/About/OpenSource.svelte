<div>
  <T msg={$t`You can find the source code of ${appName} core at # under an #.`}>
    <!-- Slot 1 doesn't need explicit declaration `slot="1"`, it breaks the code. -->
    <a href="https://github.com/mustang-im/mustang" target="_blank">GitHub</a>
    <!-- Slot 2 -->
    <a href="https://raw.githubusercontent.com/mustang-im/mustang/master/LICENSE" target="_blank" slot="2">{$t`Open-Source license`}</a>
  </T>
</div>
<div>
 {$t`${appName} is built using the following Open-Source components. We sincerely thank those authors and contributors.`}
</div>

<Test />

<iframe
  src={attributionURL}
  title="Licenses" sandbox=""
  bind:this={iframeE}
/>

<script lang="ts">
  import attributionURL from "../../../public/attribution.txt.gz?url";
  import { appName } from "../../../logic/build";
  import { fetchGzip } from "../../Util/util";
  import T from '../../../l10n/T.svelte';
  import Test from "./Test.svelte";
  import { onMount } from "svelte";
  import { t } from "../../../l10n/l10n";

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
