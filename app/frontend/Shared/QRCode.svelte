<vbox
  class="qr-code"
  role="img"
  aria-label={alt}
  style="grid-template-columns: repeat({count}, {cell}px); grid-auto-rows: {cell}px; padding: {quiet}px;"
>
  {#each modules as dark}
    <vbox class="module" class:dark></vbox>
  {/each}
</vbox>

<script lang="ts">
  import QRCode from "qrcode";

  /** The text to encode. */
  export let data: string | null;
  /** Target edge length, in CSS pixels. The module size is rounded so the code
   * stays pixel-crisp, so the actual size may be a few pixels under this. */
  export let size = 240;
  /** Error-correction level. "L" packs the most data, keeping the code less
   * dense and easier to scan off a screen. */
  export let errorCorrectionLevel: "L" | "M" | "Q" | "H" = "L";
  /** Quiet-zone width around the code, in modules (the standard is 4). */
  export let margin = 4;
  export let alt = "QR code";

  /** One boolean per module, row-major; true = dark. */
  let modules: boolean[] = [];
  /** Modules per side (the QR version's size). */
  let count = 0;
  /** Pixel size of one module. */
  let cell = 0;
  /** Quiet-zone border width in pixels. */
  let quiet = 0;

  $: data, errorCorrectionLevel, margin, size, build();

  function build() {
    if (!data) {
      modules = [];
      count = 0;
      return;
    }
    let matrix = QRCode.create(data, { errorCorrectionLevel }).modules;
    count = matrix.size;
    cell = Math.max(2, Math.floor(size / (count + margin * 2)));
    quiet = margin * cell;
    modules = Array.from(matrix.data, bit => bit === 1);
  }
</script>

<style>
  .qr-code {
    display: grid;
    width: max-content;
    background-color: #FFFFFF;
    line-height: 0;
  }
  .module {
    background-color: #FFFFFF;
  }
  .module.dark {
    background-color: #000000;
  }
</style>
