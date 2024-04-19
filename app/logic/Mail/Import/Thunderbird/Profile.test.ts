import { ThunderbirdProfile } from "./Profile";
import { connectToBackend } from "../../../../test/logic/util/backend.test";
import { expect, test } from 'vitest'

test("Read Thunderbird profiles", async () => {
  await connectToBackend();
  let profiles = await ThunderbirdProfile.findProfiles();
  expect(profiles.length).toBeGreaterThan(0);
  for (let profile of profiles) {
    console.log("Thunderbird profile name", profile.name, "path", profile.path);
  }

  for (let profile of profiles.filter(p => p.isDefault)) {
    console.log("Thunderbird default profile name", profile.name, "path", profile.path);
    try {
      let accounts = await profile.readAccounts();
      for (let account of accounts) {
        console.log("  ", account.toDebugString());
      }
    } catch (ex) {
      console.log(ex.message);
    }
  }
});
