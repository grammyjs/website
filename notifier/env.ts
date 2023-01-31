import { cleanEnv, num, str, url } from "envalid/mod.ts";

export default cleanEnv(Deno.env.toObject(), {
  SECRET: str(),
  CHAT_ID: num(),
  BASE_URL: url(),
  BOT_TOKEN: str(),
  REPOSITORY: url(),
  DATABASE_URI: str(),
  PATCH_PUSHER_API_URL: url(),
});
