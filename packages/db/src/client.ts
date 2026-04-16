import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
	throw new Error("Missing DATABASE_URL");
}

type SqlOptions = {
	ssl: false | "require";
};

export function getSqlOptions(databaseUrl: string): SqlOptions {
	const { hostname } = new URL(databaseUrl);

	return {
		ssl: hostname === "localhost" ? false : "require",
	};
}

const client = postgres(process.env.DATABASE_URL, getSqlOptions(process.env.DATABASE_URL));

export const db = drizzle({ client, schema });

export type Drizzle = typeof db;
export type DrizzleTransaction = Parameters<
	Parameters<(typeof db)["transaction"]>[0]
>[0];
