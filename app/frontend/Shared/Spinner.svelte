<grid class="loader" style="width: {size}; height: {size}" />

<script lang="ts">
  export let size: string = "100%";
</script>
<style>
  .loader {
    aspect-ratio: 1;
    display: grid;
    border: 4px solid white;
    margin: -4px;
    border-radius: 50%;
    border-right-color: #20AE9E;
    animation: l15 1s infinite linear;
  }
  .loader::before,
  .loader::after {
    content: "";
    grid-area: 1/1;
    margin: 2px;
    border: inherit;
    border-radius: 50%;
    animation: l15 2s infinite;
  }
  .loader::after {
    /* margin: 8px; TODO Makes inner part better on <StatusMessage>, but completely breaks layout in other sizes, e.g. in <RoundButton> */
    animation-duration: 3s;
  }
  @keyframes l15 {
    100% {
      transform: rotate(1turn);
    }
  }

  /*
MIT License
Copyright (c) 2022 Temani Afif

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
  */
</style>
