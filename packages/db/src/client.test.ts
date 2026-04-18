import { describe, expect, test } from "bun:test";

describe("getSqlOptions", () => {
	test("disables ssl for localhost connections", async () => {
		process.env.DATABASE_URL ??=
			"postgresql://postgres:postgres@localhost:5432/nowait24";
		const { getSqlOptions } = await import("./client");

		expect(
			getSqlOptions("postgresql://postgres:postgres@localhost:5432/nowait24"),
		).toEqual({
			ssl: false,
		});
	});

	test("requires ssl for remote connections", async () => {
		process.env.DATABASE_URL ??=
			"postgresql://postgres:postgres@localhost:5432/nowait24";
		const { getSqlOptions } = await import("./client");

		expect(
			getSqlOptions(
				"postgresql://postgres.project:secret@aws-1-us-west-2.pooler.supabase.com:5432/postgres",
			),
		).toEqual({
			ssl: "require",
		});
	});

	test("reuses the cached client when available", async () => {
		process.env.DATABASE_URL ??=
			"postgresql://postgres:postgres@localhost:5432/nowait24";
		const { getOrCreateClient } = await import("./client");
		const existingClient = { kind: "existing" };
		const createClient = () => ({ kind: "new" });

		const client = getOrCreateClient({
			createClient,
			existingClient,
			isDevelopment: true,
		});

		expect(client).toBe(existingClient);
	});

	test("caches the created client in development", async () => {
		process.env.DATABASE_URL ??=
			"postgresql://postgres:postgres@localhost:5432/nowait24";
		const { getOrCreateClient } = await import("./client");
		const globalStore: { postgresClient?: { kind: string } } = {};
		const createdClient = { kind: "new" };

		const client = getOrCreateClient({
			createClient: () => createdClient,
			globalStore,
			isDevelopment: true,
		});

		expect(client).toBe(createdClient);
		expect(globalStore.postgresClient).toBe(createdClient);
	});

	test("does not cache the client outside development", async () => {
		process.env.DATABASE_URL ??=
			"postgresql://postgres:postgres@localhost:5432/nowait24";
		const { getOrCreateClient } = await import("./client");
		const globalStore: { postgresClient?: { kind: string } } = {};
		const createdClient = { kind: "new" };

		const client = getOrCreateClient({
			createClient: () => createdClient,
			globalStore,
			isDevelopment: false,
		});

		expect(client).toBe(createdClient);
		expect(globalStore.postgresClient).toBeUndefined();
	});
});
