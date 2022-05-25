import { verify } from "https://raw.githubusercontent.com/octokit/webhooks-methods.js/v2.0.0/src/web.ts";
import env from "./env.ts";

// https://stackoverflow.com/a/71088170/10379728

export type GitHubWebhookVerificationStatus = {
  id: string;
  verified: boolean;
};

// Because this uses a native Request, it can be used in other contexts besides Oak (e.g. `std/http/serve`)
export async function verifyGitHubWebhook(
  request: Request,
): Promise<GitHubWebhookVerificationStatus> {
  const id = request.headers.get("X-GitHub-Delivery");

  // This should be more strict in reality
  if (!id) throw new Error("Not a GH webhhok");

  const signatureHeader = request.headers.get("X-Hub-Signature-256");
  let verified = false;
  if (signatureHeader) {
    const signature = signatureHeader.slice("sha256=".length);
    const payload = await request.clone().text();
    verified = await verify(env.SECRET, payload, signature);
  }
  return { id, verified };
}
