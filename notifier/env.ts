import { cleanEnv, num, str } from "envalid/mod.ts";

export default cleanEnv(Deno.env.toObject(), {
  BOT_TOKEN: str(),
  SECRET: str(),
  CHAT_ID: num(),
  DATABASE_URI: str(),
});
