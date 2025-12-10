<hbox class="loader-wrapper">
  <div class="loader"
    style:width={`${size}px`}
    style:height={`${size}px`}
    style:border-width={`${stroke}px`}
    />
</hbox>

<script lang="ts">
  export let size: number = 16;
  export let stroke: number = 3;
</script>

<style>
  .loader {
    border: solid color-mix(in srgb, transparent, currentColor 50%);
    border-radius: 50%;
    border-top-color: currentColor;
    -webkit-animation: spin 2s linear infinite; /* Safari */
    animation: spin 2s linear infinite;
  }

  /* Safari */
  @-webkit-keyframes spin {
    0% { -webkit-transform: rotate(0deg); }
    100% { -webkit-transform: rotate(360deg); }
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>
