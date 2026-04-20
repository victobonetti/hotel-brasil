import type { RemotePattern } from "next/dist/shared/lib/image-config";

function normalizeRemotePathname(pathname: string) {
	const trimmedPathname = pathname.replace(/\/+$/, "");
	return trimmedPathname.length > 0 ? `${trimmedPathname}/**` : "/**";
}

export function getRemoteImagePatterns(
	storagePublicBaseUrl?: string,
): Array<RemotePattern> {
	if (!storagePublicBaseUrl) {
		return [];
	}

	const remoteUrl = new URL(storagePublicBaseUrl);

	return [
		{
			hostname: remoteUrl.hostname,
			pathname: normalizeRemotePathname(remoteUrl.pathname),
			port: remoteUrl.port,
			protocol: remoteUrl.protocol.replace(":", "") as "http" | "https",
			search: "",
		},
	];
}
