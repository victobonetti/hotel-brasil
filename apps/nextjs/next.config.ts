import { env } from "@nowait24/utils/env";
import type { NextConfig } from "next/types";
import { getRemoteImagePatterns } from "./src/image-config";

const config: NextConfig = {
	cacheComponents: true,
	images: {
		remotePatterns: getRemoteImagePatterns(env.STORAGE_PUBLIC_BASE_URL),
	},
	/** Enables hot reloading for local packages without a build step */
	transpilePackages: [
		"@nowait24/api",
		"@nowait24/auth",
		"@nowait24/db",
		"@nowait24/ui",
	],
	typedRoutes: true,

	/** We already do linting and tscing as separate tasks in CI */
	typescript: { ignoreBuildErrors: true },
};

export default config;
