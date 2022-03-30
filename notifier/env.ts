import { cleanEnv, num, str } from "https://deno.land/x/envalid@v0.0.2/mod.ts";

export default cleanEnv(Deno.env.toObject(), {
  BOT_TOKEN: str(),
  SECRET: str(),
  CHAT_ID: num(),
  DATABASE_URI: str(),
});
