import { db } from "@finchat/db/client";
import { env } from "@finchat/utils/env";
import type { BetterAuthOptions, BetterAuthPlugin } from "better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { oAuthProxy } from "better-auth/plugins";

export function initAuth<
	TExtraPlugins extends Array<BetterAuthPlugin> = [],
>(options: {
	baseUrl: string;
	productionUrl: string;
	secret: string | undefined;
	extraPlugins?: TExtraPlugins;
}) {
	const config = {
		account: {
			modelName: "accounts",
		},
		baseURL: options.baseUrl,
		database: drizzleAdapter(db, {
			provider: "pg",
		}),
		onAPIError: {
			onError(_error, _ctx) {},
		},
		plugins: [
			oAuthProxy({
				productionURL: options.productionUrl,
			}),
			...(options.extraPlugins ?? []),
		],
		secret: options.secret,
		session: {
			modelName: "sessions",
		},
		socialProviders: {
			google: {
				clientId: env.AUTH_GOOGLE_CLIENT_ID,
				clientSecret: env.AUTH_GOOGLE_CLIENT_SECRET,
			},
		},
		user: {
			modelName: "users",
		},
		verification: {
			modelName: "verifications",
		},
	} satisfies BetterAuthOptions;

	return betterAuth(config);
}

export type Auth = ReturnType<typeof initAuth>;
export type Session = Auth["$Infer"]["Session"];
