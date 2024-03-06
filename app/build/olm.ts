import { cwd } from 'node:process'
import { join } from 'node:path'
import { unlink, link } from 'node:fs/promises'

export const olm = {
  name: "olm-wasm",
  async buildStart() {
    let src = join(cwd(), 'node_modules', 'olm', 'olm.wasm');
    let dest = join(cwd(), 'public', 'olm.wasm');
    try {
      await unlink(dest);
    } catch (ex) {
      // first time
    }
    await link(src, dest);
  },
};
