import { client } from "./integrator";

async function getAllTranslationFiles() {
  let zip = await client.get("components", "files");
}