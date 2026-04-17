import { env } from "./env";

export const getBaseUrl = () => {
	// biome-ignore lint/suspicious/noTsIgnore: This is to avoid having to cascade the dom dependency to all other packages
	//@ts-ignore-error
	if (typeof window !== "undefined") {
		// biome-ignore lint/suspicious/noTsIgnore: This is to avoid having to cascade the dom dependency to all other packages
		//@ts-ignore-error
		return window.location.origin;
	}

	if (env.VERCEL_URL) {
		if (env.VERCEL_ENV === "production") {
			return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`;
		}
		return `https://${env.VERCEL_URL}`;
	}

	return "http://localhost:3000";
};

export * from "./pagination";
