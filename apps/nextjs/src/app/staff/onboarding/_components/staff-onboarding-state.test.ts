import { describe, expect, test } from "bun:test";

import {
	canAdvanceStaffOnboardingStep,
	createStaffOnboardingInitialData,
	createStaffOnboardingSlugSuggestion,
	getNextStaffOnboardingStep,
	getPreviousStaffOnboardingStep,
	validateStaffOnboardingStep,
} from "./staff-onboarding-state";

describe("staff onboarding state", () => {
	test("creates a slug suggestion from the hotel name", () => {
		expect(createStaffOnboardingSlugSuggestion("Hotel Brasil Premium")).toBe(
			"hotel-brasil-premium",
		);
	});

	test("advances and goes back within step bounds", () => {
		expect(getNextStaffOnboardingStep(0)).toBe(1);
		expect(getNextStaffOnboardingStep(5)).toBe(5);
		expect(getPreviousStaffOnboardingStep(0)).toBe(0);
		expect(getPreviousStaffOnboardingStep(4)).toBe(3);
	});

	test("blocks step progress when required identity fields are missing", () => {
		const data = createStaffOnboardingInitialData();
		const errors = validateStaffOnboardingStep(1, data);

		expect(errors).toMatchObject({
			hotelName: "Informe o nome do hotel.",
			slug: "Use um slug com pelo menos 3 caracteres validos.",
		});
		expect(canAdvanceStaffOnboardingStep(1, data)).toBe(false);
	});

	test("allows step progress when contact and operational data are valid", () => {
		const data = {
			addressLine: "Av. Atlantica, 1000",
			city: "Rio de Janeiro",
			country: "Brasil",
			currency: "BRL",
			email: "reservas@hotelbrasil.com",
			hotelName: "Hotel Brasil",
			phone: "+55 21 99999-0000",
			slug: "hotel-brasil",
			state: "RJ",
			timezone: "America/Sao_Paulo",
		};

		expect(validateStaffOnboardingStep(4, data)).toEqual({});
		expect(canAdvanceStaffOnboardingStep(4, data)).toBe(true);
	});
});
