import { assert } from "https://deno.land/std@0.140.0/testing/asserts.ts";
import { NativeRequest } from "https://deno.land/x/oak@v10.6.0/mod.ts";
import type { ServerRequest } from "https://deno.land/x/oak@v10.6.0/types.d.ts";
import { verify } from "https://raw.githubusercontent.com/octokit/webhooks-methods.js/v2.0.0/src/web.ts";
import env from "./env.ts";

// https://stackoverflow.com/a/71088170/10379728

export type GitHubWebhookVerificationStatus = {
  id: string;
  verified: boolean;
};

// Type predicate used to access native Request instance
// Ref: https://github.com/oakserver/oak/issues/501#issuecomment-1084046581
function isNativeRequest(r: ServerRequest): r is NativeRequest {
  // deno-lint-ignore no-explicit-any
  return (r as any).request instanceof Request;
}

// Because this uses a native Request, it can be used in other contexts besides Oak (e.g. `std/http/serve`)
export async function verifyGitHubWebhook(
  request: ServerRequest,
): Promise<GitHubWebhookVerificationStatus> {
  assert(isNativeRequest(request));
  const id = request.request.headers.get("X-GitHub-Delivery");

  // This should be more strict in reality
  if (!id) throw new Error("Not a GH webhhok");

  const signatureHeader = request.headers.get("X-Hub-Signature-256");
  let verified = false;
  if (signatureHeader) {
    const signature = signatureHeader.slice("sha256=".length);
    const payload = await request.request.clone().text();
    verified = await verify(env.SECRET, payload, signature);
  }
  return { id, verified };
}
