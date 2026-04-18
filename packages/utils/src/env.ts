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
		STORAGE_ACCESS_KEY_ID: z.string().min(1).optional(),
		STORAGE_BUCKET: z.string().min(1).optional(),
		STORAGE_ENDPOINT: z.url().optional(),
		STORAGE_FORCE_PATH_STYLE: z.enum(["true", "false"]).default("true"),
		STORAGE_MENU_ITEMS_PREFIX: z.string().min(1).default("menu-items"),
		STORAGE_PUBLIC_BASE_URL: z.url().optional(),
		STORAGE_REGION: z.string().min(1).optional(),
		STORAGE_SECRET_ACCESS_KEY: z.string().min(1).optional(),
	},
	shared: {
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),
	},
	skipValidation:
		!!process.env.CI || process.env.npm_lifecycle_event === "lint",
});
