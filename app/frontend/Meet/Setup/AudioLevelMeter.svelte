<vbox class="audio-level-meter" style="min-width: {width}px; min-height: {height}px;">
  <hbox class="icon">
    <MicrophoneIcon size="24px" />
  </hbox>
  <hbox class="levels" flex>
    <vbox class="level" style="height: {Math.floor(volume)}%; width: 100%;" />
    <!--
    {#each { length: barCount} as _, i}
      <vbox class="level" style="height: {Math.floor(volumeHistory[i])}%; width: {Math.floor(100 / barCount)}%;" />
    {/each}
    -->
  </hbox>
</vbox>

<script lang="ts">
  import MicrophoneIcon from "lucide-svelte/icons/mic";
  import { catchErrors } from "../../Util/error";
  import { assert } from "../../../logic/util/util";
  import { onDestroy, onMount } from "svelte";
  import newVolumeMeter from "volume-meter";

  export let stream: MediaStream | null = null;
  export let width: number;
  export let height: number;

  let audioContext: AudioContext;
  let meter: any;

  function startMeter() {
    assert(stream, "Need audio stream");
    audioContext = new AudioContext();
    meter = newVolumeMeter(audioContext, { tweenIn: 1, tweenOut: 6 }, onVolumeChange);
    let source = audioContext.createMediaStreamSource(stream);
    source.connect(meter);
    stream.addEventListener("ended", () => meter.stop.bind(meter));
  }

  function stopMeter() {
    meter.stop.bind(meter);
    audioContext.close();
  }

  let volume: number;
  /*const barCount = 10;
  const interval = 100; // ms
  let volumeHistory: number[] = new Array(barCount).fill(0);*/

  let lastInterval = Date.now();
  function onVolumeChange(vol: number) {
    vol = Math.min(vol * 5, 100);
    volume = Math.floor(vol);
    /*if (Date.now() - lastInterval > interval) {
      lastInterval = Date.now();
      volumeHistory.pop();
      volumeHistory.unshift(volume);
      volumeHistory = volumeHistory;
      // console.log("volume", volume, " --", volumeHistory.join(", "));
    }*/
  }

  onMount(() => setTimeout(() => catchErrors(startMeter), 100)); // Wait for audio source to start
  onDestroy(() => catchErrors(stopMeter));
</script>

<style>
  .audio-level-meter {
    background-color: var(--selected-bg);
    color: var(--selected-fg);
    border-radius: 100px;
    align-items: stretch;
    justify-content: center;
    overflow: hidden;
    position: relative;
  }
  .audio-level-meter:hover {
    background-color: var(--selected-hover-bg);
    color: var(--selected-hover-fg);
  }
  .icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
  }
  .levels {
    align-items: end;
  }
  .level {
    background-color: #00e2c7;
    /* #2aebd5 #02eed3 */
  }
</style>
