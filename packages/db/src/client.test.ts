import { describe, expect, test } from "bun:test";

import { getSqlOptions } from "./client";

describe("getSqlOptions", () => {
	test("disables ssl for localhost connections", () => {
		expect(
			getSqlOptions("postgresql://postgres:postgres@localhost:5432/finchat"),
		).toEqual({
			ssl: false,
		});
	});

	test("requires ssl for remote connections", () => {
		expect(
			getSqlOptions(
				"postgresql://postgres.project:secret@aws-1-us-west-2.pooler.supabase.com:5432/postgres",
			),
		).toEqual({
			ssl: "require",
		});
	});
});
