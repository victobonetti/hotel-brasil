import { describe, expect, test } from "bun:test";

async function createCallerWithDb(db: Record<string, unknown>) {
	process.env.DATABASE_URL ??= "postgres://user:pass@localhost:5432/test";
	process.env.AUTH_GOOGLE_CLIENT_ID ??= "test-google-client-id";
	process.env.AUTH_GOOGLE_CLIENT_SECRET ??= "test-google-client-secret";
	const rootModule = await import("../root");

	return rootModule.appRouter.createCaller({
		authApi: {} as never,
		db: db as never,
		session: {
			user: {
				email: "victor@example.com",
				id: "user-1",
				name: "Victor",
			},
		} as never,
	});
}

describe("staffOnboardingRouter", () => {
	test("createInitialHotel maps slug conflicts to a TRPC conflict", async () => {
		const caller = await createCallerWithDb({
			query: {
				hotels: {
					findFirst: async () => ({ id: "hotel-1" }),
				},
				staffUserHotels: {
					findFirst: async () => null,
				},
			},
			transaction: async (callback: (tx: unknown) => Promise<void>) => {
				await callback({
					insert: () => ({
						values: async () => undefined,
					}),
				});
			},
		});

		await expect(
			caller.staffOnboarding.createInitialHotel({
				addressLine: "Rua A, 10",
				city: "Rio de Janeiro",
				country: "Brasil",
				currency: "BRL",
				email: "reservas@hotelbrasil.com",
				hotelName: "Hotel Brasil",
				phone: "+55 21 99999-0000",
				slug: "hotel-brasil",
				state: "RJ",
				timezone: "America/Sao_Paulo",
			}),
		).rejects.toMatchObject({
			code: "CONFLICT",
		});
	});

	test("createInitialHotel returns the redirect payload on success", async () => {
		let insertedTables = 0;
		const caller = await createCallerWithDb({
			query: {
				hotels: {
					findFirst: async () => null,
				},
				staffUserHotels: {
					findFirst: async () => null,
				},
			},
			transaction: async (callback: (tx: unknown) => Promise<void>) => {
				await callback({
					insert: () => ({
						values: async () => {
							insertedTables += 1;
						},
					}),
				});
			},
		});

		await expect(
			caller.staffOnboarding.createInitialHotel({
				addressLine: "Rua A, 10",
				city: "Rio de Janeiro",
				country: "Brasil",
				currency: "BRL",
				email: "reservas@hotelbrasil.com",
				hotelName: "Hotel Brasil",
				phone: "+55 21 99999-0000",
				slug: "hotel-brasil",
				state: "RJ",
				timezone: "America/Sao_Paulo",
			}),
		).resolves.toMatchObject({
			redirectTo: "/staff/orders",
			role: "admin",
			slug: "hotel-brasil",
		});
		expect(insertedTables).toBe(2);
	});
});
