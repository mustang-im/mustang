import { ThunderbirdProfile } from "./Profile";
import { connectToBackend } from "../../../../test/logic/util/backend.test";
import { expect, test } from 'vitest'

test("Read Thunderbird profiles", async () => {
  await connectToBackend();
  let profiles = await ThunderbirdProfile.findProfiles();
  expect(profiles.length).toBeGreaterThan(0);
  for (let profile of profiles.filter(p => p.name == "Main")) {
    console.log("Thunderbird default profile name", profile.name, "path", profile.path);
    try {
      let accounts = await profile.readMailAccounts();
      for (let account of accounts) {
        console.log("  ", account.toDebugString());
        console.log("     out ", account.outgoing?.toDebugString());
      }
    } catch (ex) {
      console.log(ex.message);
    }
  }
});
