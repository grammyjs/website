import { cleanEnv, num, str, url } from "envalid/mod.ts";

export default cleanEnv(Deno.env.toObject(), {
  SECRET: str(),
  CHAT_ID: num(),
  BASE_URL: url(),
  BOT_TOKEN: str(),
  DATABASE_URI: str(),
  REPOSITORY_API_URL: url(),
  REPOSITORY_CLONE_URL: url(),
  PATCH_PUSHER_API_URL: url(),
});
