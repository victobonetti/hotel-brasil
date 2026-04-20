import { randomUUID } from "node:crypto";

export interface HotelOnboardingInput {
	addressLine: string;
	city: string;
	country: string;
	currency: string;
	email: string;
	hotelName: string;
	phone: string;
	slug: string;
	state: string;
	timezone: string;
	userId: string;
}

export interface HotelOnboardingRecord {
	active: boolean;
	addressLine: string;
	city: string;
	country: string;
	currency: string;
	email: string;
	id: string;
	name: string;
	phone: string;
	slug: string;
	state: string;
	timezone: string;
}

export interface HotelMembershipRecord {
	hotelId: string;
	id: string;
	role: "admin";
	userId: string;
}

export interface HotelOnboardingStatus {
	hotelName?: string;
	needsOnboarding: boolean;
	role?: "admin" | "frontdesk" | "kitchen" | "manager";
}

export class HotelOnboardingServiceError extends Error {
	readonly code:
		| "ALREADY_HAS_HOTEL"
		| "INVALID_HOTEL_ONBOARDING"
		| "SLUG_CONFLICT";

	constructor(
		code: "ALREADY_HAS_HOTEL" | "INVALID_HOTEL_ONBOARDING" | "SLUG_CONFLICT",
		message: string,
	) {
		super(message);
		this.code = code;
		this.name = "HotelOnboardingServiceError";
	}
}

function normalizeWhitespace(value: string) {
	return value.trim().replace(/\s+/g, " ");
}

export function normalizeHotelSlug(value: string) {
	return normalizeWhitespace(value)
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.replace(/-{2,}/g, "-");
}

function assertRequiredField(value: string, fieldName: string) {
	if (normalizeWhitespace(value).length === 0) {
		throw new HotelOnboardingServiceError(
			"INVALID_HOTEL_ONBOARDING",
			`${fieldName} is required`,
		);
	}
}

function assertValidEmail(email: string) {
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeWhitespace(email))) {
		throw new HotelOnboardingServiceError(
			"INVALID_HOTEL_ONBOARDING",
			"Hotel email must be valid",
		);
	}
}

function assertValidTimezone(timezone: string) {
	if (!normalizeWhitespace(timezone).includes("/")) {
		throw new HotelOnboardingServiceError(
			"INVALID_HOTEL_ONBOARDING",
			"Hotel timezone must be valid",
		);
	}
}

function assertValidCurrency(currency: string) {
	if (!/^[A-Z]{3}$/.test(normalizeWhitespace(currency).toUpperCase())) {
		throw new HotelOnboardingServiceError(
			"INVALID_HOTEL_ONBOARDING",
			"Hotel currency must be a 3-letter code",
		);
	}
}

export function normalizeHotelOnboardingInput(
	input: Omit<HotelOnboardingInput, "userId">,
) {
	assertRequiredField(input.hotelName, "Hotel name");
	assertRequiredField(input.slug, "Hotel slug");
	assertRequiredField(input.phone, "Hotel phone");
	assertRequiredField(input.email, "Hotel email");
	assertRequiredField(input.addressLine, "Hotel address");
	assertRequiredField(input.city, "Hotel city");
	assertRequiredField(input.state, "Hotel state");
	assertRequiredField(input.country, "Hotel country");
	assertRequiredField(input.timezone, "Hotel timezone");
	assertRequiredField(input.currency, "Hotel currency");
	assertValidEmail(input.email);
	assertValidTimezone(input.timezone);
	assertValidCurrency(input.currency);

	const slug = normalizeHotelSlug(input.slug);
	if (slug.length < 3) {
		throw new HotelOnboardingServiceError(
			"INVALID_HOTEL_ONBOARDING",
			"Hotel slug must have at least 3 characters",
		);
	}

	return {
		addressLine: normalizeWhitespace(input.addressLine),
		city: normalizeWhitespace(input.city),
		country: normalizeWhitespace(input.country),
		currency: normalizeWhitespace(input.currency).toUpperCase(),
		email: normalizeWhitespace(input.email).toLowerCase(),
		hotelName: normalizeWhitespace(input.hotelName),
		phone: normalizeWhitespace(input.phone),
		slug,
		state: normalizeWhitespace(input.state),
		timezone: normalizeWhitespace(input.timezone),
	};
}

export async function getHotelOnboardingStatus(
	deps: {
		findMembershipByUserId: (userId: string) =>
			| Promise<{
					hotel?: { name: string } | null;
					role: "admin" | "frontdesk" | "kitchen" | "manager";
			  } | null>
			| {
					hotel?: { name: string } | null;
					role: "admin" | "frontdesk" | "kitchen" | "manager";
			  }
			| null;
	},
	input: { userId: string },
): Promise<HotelOnboardingStatus> {
	const membership = await deps.findMembershipByUserId(input.userId);

	if (!membership) {
		return {
			needsOnboarding: true,
		};
	}

	return {
		hotelName: membership.hotel?.name,
		needsOnboarding: false,
		role: membership.role,
	};
}

export async function createInitialHotel(
	deps: {
		createHotelAndMembership: (records: {
			hotel: HotelOnboardingRecord;
			membership: HotelMembershipRecord;
		}) => Promise<void> | void;
		findHotelBySlug: (
			slug: string,
		) => Promise<{ id: string } | null> | { id: string } | null;
		findMembershipByUserId: (
			userId: string,
		) => Promise<{ hotelId: string } | null> | { hotelId: string } | null;
	},
	input: HotelOnboardingInput,
) {
	const existingMembership = await deps.findMembershipByUserId(input.userId);
	if (existingMembership) {
		throw new HotelOnboardingServiceError(
			"ALREADY_HAS_HOTEL",
			"User already has a hotel",
		);
	}

	const normalized = normalizeHotelOnboardingInput(input);
	const existingHotel = await deps.findHotelBySlug(normalized.slug);
	if (existingHotel) {
		throw new HotelOnboardingServiceError(
			"SLUG_CONFLICT",
			"Hotel slug already exists",
		);
	}

	const hotelId = randomUUID();
	const hotel: HotelOnboardingRecord = {
		active: true,
		addressLine: normalized.addressLine,
		city: normalized.city,
		country: normalized.country,
		currency: normalized.currency,
		email: normalized.email,
		id: hotelId,
		name: normalized.hotelName,
		phone: normalized.phone,
		slug: normalized.slug,
		state: normalized.state,
		timezone: normalized.timezone,
	};
	const membership: HotelMembershipRecord = {
		hotelId,
		id: randomUUID(),
		role: "admin",
		userId: input.userId,
	};

	await deps.createHotelAndMembership({
		hotel,
		membership,
	});

	return {
		hotelId,
		hotelName: hotel.name,
		redirectTo: "/staff/orders" as const,
		role: membership.role,
		slug: hotel.slug,
	};
}
