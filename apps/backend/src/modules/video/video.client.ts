import Mux from "@mux/mux-node";
import { env } from "../../shared/config/env.js";
import { logger } from "../../shared/utils/logger.js";

const muxTokenId = env.MUX_TOKEN_ID;
const muxTokenSecret = env.MUX_TOKEN_SECRET;

if ((!muxTokenId || !muxTokenSecret) && env.NODE_ENV === "production") {
  throw new Error("MUX_TOKEN_ID and MUX_TOKEN_SECRET are required in production");
}

export const mux = new Mux({
  tokenId: muxTokenId ?? "mux_placeholder_token_id",
  tokenSecret: muxTokenSecret ?? "mux_placeholder_token_secret",
});

if ((!muxTokenId || !muxTokenSecret) && env.NODE_ENV !== "production") {
  logger.warn(
    "Mux disabled: MUX_TOKEN_ID or MUX_TOKEN_SECRET not configured. Video endpoints will fail until you add real credentials.",
  );
}
