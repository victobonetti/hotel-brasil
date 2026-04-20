import { describe, expect, test } from "bun:test";

import {
	createInitialHotel,
	getHotelOnboardingStatus,
	normalizeHotelOnboardingInput,
} from "./hotel-onboarding-service";

const validInput = {
	addressLine: "Av. Atlantica, 1000",
	city: "Rio de Janeiro",
	country: "Brasil",
	currency: "brl",
	email: "RESERVAS@HOTELBRASIL.COM",
	hotelName: " Hotel Brasil ",
	phone: "+55 21 99999-0000",
	slug: " Hotel Brasil Premium ",
	state: "RJ",
	timezone: "America/Sao_Paulo",
	userId: "user-1",
};

describe("normalizeHotelOnboardingInput", () => {
	test("normalizes slug, currency, whitespace, and email casing", () => {
		expect(normalizeHotelOnboardingInput(validInput)).toMatchObject({
			currency: "BRL",
			email: "reservas@hotelbrasil.com",
			hotelName: "Hotel Brasil",
			slug: "hotel-brasil-premium",
		});
	});

	test("rejects invalid onboarding payloads", () => {
		expect(() =>
			normalizeHotelOnboardingInput({
				...validInput,
				email: "not-an-email",
				slug: "!!",
			}),
		).toThrow(/Hotel email must be valid/);
	});
});

describe("getHotelOnboardingStatus", () => {
	test("returns onboarding required when the user has no membership", async () => {
		const status = await getHotelOnboardingStatus(
			{
				findMembershipByUserId: () => null,
			},
			{ userId: "user-1" },
		);

		expect(status).toEqual({
			needsOnboarding: true,
		});
	});

	test("returns hotel summary when the user already has membership", async () => {
		const status = await getHotelOnboardingStatus(
			{
				findMembershipByUserId: () => ({
					hotel: { name: "Hotel Brasil" },
					role: "admin" as const,
				}),
			},
			{ userId: "user-1" },
		);

		expect(status).toEqual({
			hotelName: "Hotel Brasil",
			needsOnboarding: false,
			role: "admin",
		});
	});
});

describe("createInitialHotel", () => {
	test("creates hotel and admin membership with normalized slug", async () => {
		let persisted:
			| {
					hotel: { slug: string; currency: string; name: string };
					membership: { role: "admin"; userId: string };
			  }
			| undefined;

		const result = await createInitialHotel(
			{
				createHotelAndMembership: (records) => {
					persisted = records;
				},
				findHotelBySlug: () => null,
				findMembershipByUserId: () => null,
			},
			validInput,
		);

		expect(result).toMatchObject({
			hotelName: "Hotel Brasil",
			redirectTo: "/staff/orders",
			role: "admin",
			slug: "hotel-brasil-premium",
		});
		expect(persisted).toMatchObject({
			hotel: {
				currency: "BRL",
				name: "Hotel Brasil",
				slug: "hotel-brasil-premium",
			},
			membership: {
				role: "admin",
				userId: "user-1",
			},
		});
	});

	test("blocks creation when the user already has a hotel", async () => {
		await expect(
			createInitialHotel(
				{
					createHotelAndMembership: () => undefined,
					findHotelBySlug: () => null,
					findMembershipByUserId: () => ({ hotelId: "hotel-1" }),
				},
				validInput,
			),
		).rejects.toMatchObject({ code: "ALREADY_HAS_HOTEL" });
	});

	test("rejects conflicting slugs", async () => {
		await expect(
			createInitialHotel(
				{
					createHotelAndMembership: () => undefined,
					findHotelBySlug: () => ({ id: "hotel-2" }),
					findMembershipByUserId: () => null,
				},
				validInput,
			),
		).rejects.toMatchObject({ code: "SLUG_CONFLICT" });
	});
});
