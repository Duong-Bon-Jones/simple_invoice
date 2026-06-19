import "server-only";
import { z } from "zod";

const EnvSchema = z.object({
  IDENTITY_BASE_URL: z.url(),
  OAUTH_CLIENT_ID: z.string().min(1),
  OAUTH_CLIENT_SECRET: z.string().min(1),
  API_BASE_URL: z.url(),
});

export const env = EnvSchema.parse({
  IDENTITY_BASE_URL: process.env.IDENTITY_BASE_URL,
  OAUTH_CLIENT_ID: process.env.OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET: process.env.OAUTH_CLIENT_SECRET,
  API_BASE_URL: process.env.API_BASE_URL,
});

export const membershipServiceUrl = `${env.API_BASE_URL}/membership-service/1.0.0`;
export const invoiceServiceUrl = `${env.API_BASE_URL}/invoice-service/1.0.0`;
