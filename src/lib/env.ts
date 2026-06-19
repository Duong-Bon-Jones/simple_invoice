import "server-only";
import { z } from "zod";

const EnvSchema = z.object({
  IDENTITY_BASE_URL: z.url(),
  OAUTH_CLIENT_ID: z.string().min(1),
  OAUTH_CLIENT_SECRET: z.string().min(1),
  MEMBERSHIP_SERVICE_URL: z.url(),
  INVOICE_SERVICE_URL: z.url(),
});

export const env = EnvSchema.parse({
  IDENTITY_BASE_URL: process.env.IDENTITY_BASE_URL,
  OAUTH_CLIENT_ID: process.env.OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET: process.env.OAUTH_CLIENT_SECRET,
  MEMBERSHIP_SERVICE_URL: process.env.MEMBERSHIP_SERVICE_URL,
  INVOICE_SERVICE_URL: process.env.INVOICE_SERVICE_URL,
});
