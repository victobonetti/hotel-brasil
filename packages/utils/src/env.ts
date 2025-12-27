import { createEnv } from "@t3-oss/env-nextjs";
import { vercel } from "@t3-oss/env-nextjs/presets-zod";
import { z } from "zod/v4";

export const env = createEnv({
	client: {},
	experimental__runtimeEnv: {
		NODE_ENV: process.env.NODE_ENV,
	},
	extends: [vercel()],
	server: {
		AUTH_GOOGLE_CLIENT_ID: z.string().min(1),
		AUTH_GOOGLE_CLIENT_SECRET: z.string().min(1),
		AUTH_SECRET:
			process.env.NODE_ENV === "production"
				? z.string().min(1)
				: z.string().min(1).optional(),
		DATABASE_URL: z.url(),
	},
	shared: {
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),
	},
	skipValidation:
		!!process.env.CI || process.env.npm_lifecycle_event === "lint",
});
