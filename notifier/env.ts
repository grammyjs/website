import "https://deno.land/x/dotenv/load.ts";
import { cleanEnv, num, str } from "https://deno.land/x/envalid/mod.ts";

export default cleanEnv(Deno.env.toObject(), {
  BOT_TOKEN: str(),
  SECRET: str(),
  CHAT_ID: num(),
});
