import { drizzle } from "drizzle-orm/postgres-js";
import postgres, { type Sql } from "postgres";

import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
	throw new Error("Missing DATABASE_URL");
}

const databaseUrl = process.env.DATABASE_URL;

interface SqlOptions {
	ssl: false | "require";
}

type PostgresClient = Sql<Record<string, unknown>>;

interface GetOrCreateClientOptions<TClient> {
	createClient: () => TClient;
	existingClient?: TClient;
	globalStore?: {
		postgresClient?: TClient;
	};
	isDevelopment: boolean;
}

export function getSqlOptions(databaseUrl: string): SqlOptions {
	const { hostname } = new URL(databaseUrl);

	return {
		ssl: hostname === "localhost" ? false : "require",
	};
}

export function getOrCreateClient<TClient>({
	createClient,
	existingClient,
	globalStore,
	isDevelopment,
}: GetOrCreateClientOptions<TClient>): TClient {
	if (existingClient) {
		return existingClient;
	}

	const client = createClient();

	if (isDevelopment && globalStore) {
		globalStore.postgresClient = client;
	}

	return client;
}

declare global {
	var __finchatPostgresClient__: PostgresClient | undefined;
}

const client = getOrCreateClient({
	createClient: () => postgres(databaseUrl, getSqlOptions(databaseUrl)),
	existingClient:
		process.env.NODE_ENV === "development"
			? globalThis.__finchatPostgresClient__
			: undefined,
	globalStore:
		process.env.NODE_ENV === "development"
			? {
					get postgresClient() {
						return globalThis.__finchatPostgresClient__;
					},
					set postgresClient(client) {
						globalThis.__finchatPostgresClient__ = client;
					},
				}
			: undefined,
	isDevelopment: process.env.NODE_ENV === "development",
});

export const db = drizzle({ client, schema });

export type Drizzle = typeof db;
export type DrizzleTransaction = Parameters<
	Parameters<(typeof db)["transaction"]>[0]
>[0];
