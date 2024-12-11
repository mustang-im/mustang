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
SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>

SPDX-License-Identifier: EUPL-1.2
-->
