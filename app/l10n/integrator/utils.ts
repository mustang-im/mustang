import { client } from "./integrator";

export async function getLanguages(): Promise<string[]> {
  let json = await (await client.get("components", "translations")).json();
  let languages = json.results.map((r) => r.language.code);
  return languages;
}