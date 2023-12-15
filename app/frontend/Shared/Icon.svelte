<script lang="ts">
  /**
   * This was imported from 
   * https://github.com/cristovao-trevisan/svelte-icon/blob/master/src/lib/Icon.svelte
   * and modified to add a `<slot/>`
   *
   * MIT license
   * Copyright (c) 2019 Cristóvão Trevisan and Mustang
   */

  export let data = '';
  export let viewBox = extractViewBox(data);

  export let size = '20px';
  export let width = size;
  export let height = size;

  export let color = 'currentColor';
  export let stroke = color;
  export let fill = color;

  $: elements = data
    .replace(/<svg[ \n]([^>]*)>/, '')
    .replace('</svg>', '');

  function extractViewBox(svg: string) {
    const regex = /viewBox="([\d\- \.]+)"/;
    const res = regex.exec(svg);
    return res ? res[1] : '0 0 20 20';
  }

  //   {...$$restProps}
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  {width}
  {height}
  {viewBox}
  {stroke}
  {fill}
>
  {@html elements}
  <slot />
</svg>

<!--
Copyright (c) 2019 Cristóvão Trevisan

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
-->
