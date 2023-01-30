import { cleanEnv, num, str, url } from "envalid/mod.ts";

export default cleanEnv(Deno.env.toObject(), {
  BOT_TOKEN: str(),
  SECRET: str(),
  CHAT_ID: num(),
  DATABASE_URI: str(),
  PATCH_PUSHER_API_URL: url(),
  REPOSITORY: url(),
});
