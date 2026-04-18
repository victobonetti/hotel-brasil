import "server-only";

import { initAuth } from "@nowait24/auth";
import { getBaseUrl } from "@nowait24/utils";
import { env } from "@nowait24/utils/env";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { cache } from "react";

export const auth = initAuth({
	baseUrl: getBaseUrl(),
	extraPlugins: [nextCookies()],
	productionUrl: `https://${env.VERCEL_PROJECT_PRODUCTION_URL ?? "nowait24.vercel.app"}`,
	secret: env.AUTH_SECRET,
});

export const getSession = cache(async () =>
	auth.api.getSession({ headers: await headers() }),
);
