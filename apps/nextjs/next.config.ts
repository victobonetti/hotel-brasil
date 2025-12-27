// biome-ignore lint/correctness/noUnusedImports: Import env files to validate at build time
import { env } from "@finchat/utils/env";
import type { NextConfig } from "next/types";

const config: NextConfig = {
	cacheComponents: true,
	/** Enables hot reloading for local packages without a build step */
	transpilePackages: [
		"@finchat/api",
		"@finchat/auth",
		"@finchat/db",
		"@finchat/ui",
	],
	typedRoutes: true,

	/** We already do linting and tscing as separate tasks in CI */
	typescript: { ignoreBuildErrors: true },
};

export default config;
