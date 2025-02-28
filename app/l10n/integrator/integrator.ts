import { Client } from "./client";

export let client: Client;

export async function init() {
  client = new Client();
}