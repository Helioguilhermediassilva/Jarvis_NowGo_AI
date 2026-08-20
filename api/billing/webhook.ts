import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

import { handleStripeWebhook } from "../../server/billing/stripeService.js";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const signature = req.headers["stripe-signature"];
  if (typeof signature !== "string") {
    return res.status(400).json({ error: "missing_stripe_signature" });
  }

  try {
    const rawBody = await readRawBody(req);
    const result = await handleStripeWebhook(rawBody, signature);
    return res.status(200).json({ received: true, ...result });
  } catch (error) {
    if (error instanceof Stripe.errors.StripeSignatureVerificationError) {
      return res.status(400).json({ error: "invalid_stripe_signature" });
    }
    console.error("[billing.webhook] erro:", error instanceof Error ? error.message : error);
    return res.status(500).json({ error: "webhook_processing_failed" });
  }
}

async function readRawBody(req: VercelRequest): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req as unknown as AsyncIterable<Buffer | string>) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}
