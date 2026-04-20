import { describe, expect, test } from "bun:test";

import { getRemoteImagePatterns } from "./image-config";

describe("getRemoteImagePatterns", () => {
	test("returns an empty list when the storage base url is missing", () => {
		expect(getRemoteImagePatterns(undefined)).toEqual([]);
	});

	test("builds a remote pattern from the configured public base url", () => {
		expect(
			getRemoteImagePatterns(
				"https://namespace.compat.objectstorage.sa-saopaulo-1.oraclecloud.com/bucket-20260418-1411",
			),
		).toEqual([
			{
				hostname:
					"namespace.compat.objectstorage.sa-saopaulo-1.oraclecloud.com",
				pathname: "/bucket-20260418-1411/**",
				port: "",
				protocol: "https",
				search: "",
			},
		]);
	});

	test("allows objects when the base url has no explicit path", () => {
		expect(getRemoteImagePatterns("https://cdn.example.com")).toEqual([
			{
				hostname: "cdn.example.com",
				pathname: "/**",
				port: "",
				protocol: "https",
				search: "",
			},
		]);
	});
});
