/** The production Signal `ServerPublicParams` — the chat server's zkgroup public
 * params, needed to verify the daily group auth credential and build its
 * presentation (Docs/04 §2). This is the public, hardcoded production constant
 * shipped in the official client (Signal-Android `app/build.gradle.kts`
 * `ZKGROUP_SERVER_PUBLIC_PARAMS`, the non-staging value); it is not a secret. */
import { ServerPublicParams } from "../Encryption/ZKGroup/credentials";
import { base64Decode } from "../Crypto/primitives";

/** Signal production `ZKGROUP_SERVER_PUBLIC_PARAMS` (Signal-Android BuildConfig).
 * 673 bytes when decoded; embeds `generic_credential_public_key`. */
const kZkGroupServerPublicParamsBase64 =
  "AMhf5ywVwITZMsff/eCyudZx9JDmkkkbV6PInzG4p8x3VqVJSFiMvnvlEKWuRob/" +
  "1eaIetR31IYeAbm0NdOuHH8Qi+Rexi1wLlpzIo1gstHWBfZzy1+qHRV5A4TqPp15" +
  "YzBPm0WSggW6PbSn+F4lf57VCnHF7p8SvzAA2ZZJPYJURt8X7bbg+H3i+PEjH9DX" +
  "ItNEqs2sNcug37xZQDLm7X36nOoGPs54XsEGzPdEV+itQNGUFEjY6X9Uv+Acuks7" +
  "NpyGvCoKxGwgKgE5XyJ+nNKlyHHOLb6N1NuHyBrZrgtY/JYJHRooo5CEqYKBqdFn" +
  "mbTVGEkCvJKxLnjwKWf+fEPoWeQFj5ObDjcKMZf2Jm2Ae69x+ikU5gBXsRmoF94G" +
  "XTLfN0/vLt98KDPnxwAQL9j5V1jGOY8jQl6MLxEs56cwXN0dqCnImzVH3TZT1cJ8" +
  "SW1BRX6qIVxEzjsSGx3yxF3suAilPMqGRp4ffyopjMD1JXiKR2RwLKzizUe5e8Xy" +
  "GOy9fplzhw3jVzTRyUZTRSZKkMLWcQ/gv0E4aONNqs4P+NameAZYOD12qRkxosQQ" +
  "P5uux6B2nRyZ7sAV54DgFyLiRcq1FvwKw2EPQdk4HDoePrO/RNUbyNddnM/mMgj4" +
  "FW65xCoT1LmjrIjsv/Ggdlx46ueczhMgtBunx1/w8k8V+l8LVZ8gAT6wkU5J+DPQ" +
  "alQguMg12Jzug3q4TbdHiGCmD9EunCwOmsLuLJkz6EcSYXtrlDEnAM+hicw7ierg" +
  "YLLlMXpfTdGxJCWJmP4zqUFeTTmsmhsjGBt7NiEB/9pFFEB3pSbf4iiUukw63Eo8" +
  "Aqnf4iwob6X1QviCWuc8t0LUlT9vALgh/f2DPVOOmR0RW6bgRvc7DSF20V/omg+YBw==";

let cached: ServerPublicParams | null = null;

/** The production chat-server public params, parsed once and cached. */
export function signalServerPublicParams(): ServerPublicParams {
  return cached ??= ServerPublicParams.deserialize(base64Decode(kZkGroupServerPublicParamsBase64));
}
