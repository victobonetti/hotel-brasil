import { randomUUID } from "node:crypto";
import { buildPaginationMetadata, type PaginatedResult } from "@nowait24/utils";
import { assertUserCanManageHotel } from "../domain/order";
import type { StaffHotelMembership } from "../services/order-service";

export interface CatalogCategoryRecord {
	active: boolean;
	description: string | null;
	hotelId: string;
	id: string;
	name: string;
	sortOrder: number;
}

export interface CatalogMenuItemRecord {
	available: boolean;
	categoryId: string;
	description: string | null;
	hotelId: string;
	id: string;
	imageStorageKey: string | null;
	imageUrl: string | null;
	name: string;
	preparationTimeMinutes: number | null;
	priceInCents: number;
}

type CatalogAdminRole = "admin" | "manager";

function assertCatalogAdminRole(role: string) {
	if (role !== "admin" && role !== "manager") {
		throw new Error("Only admin or manager can manage the catalog");
	}

	return role as CatalogAdminRole;
}

export class CatalogAdminServiceError extends Error {
	constructor(
		public readonly code:
			| "CATEGORY_NOT_FOUND"
			| "INVALID_IMAGE"
			| "INVALID_PRICE"
			| "ITEM_NOT_FOUND"
			| "STAFF_MEMBERSHIP_REQUIRED"
			| "TENANT_MISMATCH"
			| "UNAUTHORIZED_ROLE",
		message: string,
	) {
		super(message);
		this.name = "CatalogAdminServiceError";
	}
}

function toCatalogAdminServiceError(error: unknown): never {
	if (error instanceof Error) {
		if (
			error.message.includes("not assigned") ||
			error.message.includes("cannot manage another hotel")
		) {
			throw new CatalogAdminServiceError(
				"STAFF_MEMBERSHIP_REQUIRED",
				error.message,
			);
		}

		if (error.message.includes("Only admin or manager")) {
			throw new CatalogAdminServiceError("UNAUTHORIZED_ROLE", error.message);
		}

		if (
			error.message.includes("another hotel") ||
			error.message.includes("same hotel")
		) {
			throw new CatalogAdminServiceError("TENANT_MISMATCH", error.message);
		}

		if (error.message.includes("price")) {
			throw new CatalogAdminServiceError("INVALID_PRICE", error.message);
		}

		if (error.message.includes("image")) {
			throw new CatalogAdminServiceError("INVALID_IMAGE", error.message);
		}
	}

	throw error;
}

function assertNonNegativePrice(priceInCents: number) {
	if (!Number.isInteger(priceInCents) || priceInCents < 0) {
		throw new Error("Menu item price must be a non-negative integer");
	}
}

function normalizeImageUrl(imageUrl?: string | null) {
	if (imageUrl === undefined) {
		return;
	}

	if (imageUrl === null) {
		return null;
	}

	const normalizedImageUrl = imageUrl.trim();
	if (normalizedImageUrl.length === 0) {
		return null;
	}

	if (normalizedImageUrl.startsWith("data:image/")) {
		return normalizedImageUrl;
	}

	try {
		const parsedUrl = new URL(normalizedImageUrl);
		if (
			parsedUrl.protocol !== "http:" &&
			parsedUrl.protocol !== "https:"
		) {
			throw new Error("Menu item image must be a valid public image url");
		}
	} catch {
		throw new Error("Menu item image must be a valid public image url");
	}

	return normalizedImageUrl;
}

function normalizeImageStorageKey(imageStorageKey?: string | null) {
	if (imageStorageKey === undefined) {
		return;
	}

	if (imageStorageKey === null) {
		return null;
	}

	const normalizedImageStorageKey = imageStorageKey.trim();
	return normalizedImageStorageKey.length === 0
		? null
		: normalizedImageStorageKey;
}

function assertSameHotel(
	resourceHotelId: string,
	hotelId: string,
	entity: string,
) {
	if (resourceHotelId !== hotelId) {
		throw new Error(`${entity} must belong to the same hotel`);
	}
}

function ensureCatalogAccess(
	userId: string,
	membership: StaffHotelMembership | null,
) {
	if (!membership) {
		throw new Error("User is not assigned to this hotel");
	}

	assertUserCanManageHotel(userId, membership, membership.hotelId);
	const resolvedMembership = membership as StaffHotelMembership;
	assertCatalogAdminRole(resolvedMembership.role);
	return resolvedMembership;
}

export async function listCategoriesForStaff(
	deps: {
		countCategoriesByHotelId: (hotelId: string) => Promise<number> | number;
		findMembershipByUserId: (
			userId: string,
		) => Promise<StaffHotelMembership | null> | StaffHotelMembership | null;
		listCategoriesByHotelId: (
			hotelId: string,
			input: { limit: number; offset: number },
		) => Promise<Array<CatalogCategoryRecord>> | Array<CatalogCategoryRecord>;
	},
	input: { page?: number; pageSize: number; userId: string },
): Promise<PaginatedResult<CatalogCategoryRecord>> {
	const membership = await deps.findMembershipByUserId(input.userId);
	let access: StaffHotelMembership;
	try {
		access = ensureCatalogAccess(input.userId, membership);
	} catch (error) {
		toCatalogAdminServiceError(error);
	}

	const totalItems = await deps.countCategoriesByHotelId(access.hotelId);
	const pagination = buildPaginationMetadata({
		page: input.page,
		pageSize: input.pageSize,
		totalItems,
	});

	return {
		items: await deps.listCategoriesByHotelId(access.hotelId, {
			limit: pagination.pageSize,
			offset: (pagination.page - 1) * pagination.pageSize,
		}),
		pagination,
	};
}

export async function listMenuItemsForStaff(
	deps: {
		countMenuItemsByHotelId: (hotelId: string) => Promise<number> | number;
		findMembershipByUserId: (
			userId: string,
		) => Promise<StaffHotelMembership | null> | StaffHotelMembership | null;
		listMenuItemsByHotelId: (
			hotelId: string,
			input: { limit: number; offset: number },
		) => Promise<Array<CatalogMenuItemRecord>> | Array<CatalogMenuItemRecord>;
	},
	input: { page?: number; pageSize: number; userId: string },
): Promise<PaginatedResult<CatalogMenuItemRecord>> {
	const membership = await deps.findMembershipByUserId(input.userId);
	let access: StaffHotelMembership;
	try {
		access = ensureCatalogAccess(input.userId, membership);
	} catch (error) {
		toCatalogAdminServiceError(error);
	}

	const totalItems = await deps.countMenuItemsByHotelId(access.hotelId);
	const pagination = buildPaginationMetadata({
		page: input.page,
		pageSize: input.pageSize,
		totalItems,
	});

	return {
		items: await deps.listMenuItemsByHotelId(access.hotelId, {
			limit: pagination.pageSize,
			offset: (pagination.page - 1) * pagination.pageSize,
		}),
		pagination,
	};
}

export async function createCategory(
	deps: {
		createCategoryRecord: (
			category: CatalogCategoryRecord,
		) => Promise<void> | void;
		findMembershipByUserId: (
			userId: string,
		) => Promise<StaffHotelMembership | null> | StaffHotelMembership | null;
		listCategoriesByHotelId: (
			hotelId: string,
		) => Promise<Array<CatalogCategoryRecord>> | Array<CatalogCategoryRecord>;
	},
	input: {
		active?: boolean;
		description?: string;
		name: string;
		sortOrder?: number;
		userId: string;
	},
) {
	const membership = await deps.findMembershipByUserId(input.userId);
	let access: StaffHotelMembership;
	try {
		access = ensureCatalogAccess(input.userId, membership);
	} catch (error) {
		toCatalogAdminServiceError(error);
	}

	const existingCategories = await deps.listCategoriesByHotelId(access.hotelId);
	const category: CatalogCategoryRecord = {
		active: input.active ?? true,
		description: input.description ?? null,
		hotelId: access.hotelId,
		id: randomUUID(),
		name: input.name,
		sortOrder: input.sortOrder ?? existingCategories.length,
	};

	await deps.createCategoryRecord(category);
	return category;
}

export async function updateCategory(
	deps: {
		findCategoryById: (
			categoryId: string,
		) => Promise<CatalogCategoryRecord | null> | CatalogCategoryRecord | null;
		findMembershipByUserId: (
			userId: string,
		) => Promise<StaffHotelMembership | null> | StaffHotelMembership | null;
		updateCategoryRecord: (
			categoryId: string,
			category: Partial<CatalogCategoryRecord>,
		) => Promise<void> | void;
	},
	input: {
		active?: boolean;
		categoryId: string;
		description?: string;
		name?: string;
		userId: string;
	},
) {
	const category = await deps.findCategoryById(input.categoryId);
	if (!category) {
		throw new CatalogAdminServiceError(
			"CATEGORY_NOT_FOUND",
			"Category was not found",
		);
	}

	const membership = await deps.findMembershipByUserId(input.userId);
	try {
		ensureCatalogAccess(input.userId, membership);
		assertUserCanManageHotel(input.userId, membership, category.hotelId);
	} catch (error) {
		toCatalogAdminServiceError(error);
	}

	await deps.updateCategoryRecord(input.categoryId, {
		active: input.active ?? category.active,
		description: input.description ?? category.description,
		name: input.name ?? category.name,
	});

	return {
		...category,
		active: input.active ?? category.active,
		description: input.description ?? category.description,
		name: input.name ?? category.name,
	};
}

export async function reorderCategories(
	deps: {
		findMembershipByUserId: (
			userId: string,
		) => Promise<StaffHotelMembership | null> | StaffHotelMembership | null;
		listCategoriesByIds: (
			categoryIds: Array<string>,
		) => Promise<Array<CatalogCategoryRecord>> | Array<CatalogCategoryRecord>;
		updateCategoryRecord: (
			categoryId: string,
			category: Partial<CatalogCategoryRecord>,
		) => Promise<void> | void;
	},
	input: {
		categoryIds: Array<string>;
		userId: string;
	},
) {
	const membership = await deps.findMembershipByUserId(input.userId);
	let access: StaffHotelMembership;
	try {
		access = ensureCatalogAccess(input.userId, membership);
	} catch (error) {
		toCatalogAdminServiceError(error);
	}

	const categories = await deps.listCategoriesByIds(input.categoryIds);
	for (const category of categories) {
		try {
			assertSameHotel(category.hotelId, access.hotelId, "Category");
		} catch (error) {
			toCatalogAdminServiceError(error);
		}
	}

	if (categories.length !== input.categoryIds.length) {
		throw new CatalogAdminServiceError(
			"CATEGORY_NOT_FOUND",
			"Category was not found",
		);
	}

	const startingSortOrder = Math.min(
		...categories.map((category) => category.sortOrder),
	);
	await Promise.all(
		input.categoryIds.map((categoryId, index) =>
			deps.updateCategoryRecord(categoryId, {
				sortOrder: startingSortOrder + index,
			}),
		),
	);

	return input.categoryIds.map((categoryId, index) => ({
		categoryId,
		sortOrder: startingSortOrder + index,
	}));
}

export async function createMenuItem(
	deps: {
		createMenuItemRecord: (item: CatalogMenuItemRecord) => Promise<void> | void;
		findCategoryById: (
			categoryId: string,
		) => Promise<CatalogCategoryRecord | null> | CatalogCategoryRecord | null;
		findMembershipByUserId: (
			userId: string,
		) => Promise<StaffHotelMembership | null> | StaffHotelMembership | null;
	},
	input: {
		available?: boolean;
		categoryId: string;
		description?: string;
		imageStorageKey?: string;
		imageUrl?: string;
		name: string;
		preparationTimeMinutes?: number;
		priceInCents: number;
		userId: string;
	},
) {
	const membership = await deps.findMembershipByUserId(input.userId);
	let access: StaffHotelMembership;
	let normalizedImageUrl: string | null | undefined;
	let normalizedImageStorageKey: string | null | undefined;
	try {
		access = ensureCatalogAccess(input.userId, membership);
		assertNonNegativePrice(input.priceInCents);
		normalizedImageUrl = normalizeImageUrl(input.imageUrl);
		normalizedImageStorageKey = normalizeImageStorageKey(input.imageStorageKey);
	} catch (error) {
		toCatalogAdminServiceError(error);
	}

	const category = await deps.findCategoryById(input.categoryId);
	if (!category) {
		throw new CatalogAdminServiceError(
			"CATEGORY_NOT_FOUND",
			"Category was not found",
		);
	}

	try {
		assertSameHotel(category.hotelId, access.hotelId, "Category");
	} catch (error) {
		toCatalogAdminServiceError(error);
	}

	const item: CatalogMenuItemRecord = {
		available: input.available ?? true,
		categoryId: input.categoryId,
		description: input.description ?? null,
		hotelId: access.hotelId,
		id: randomUUID(),
		imageStorageKey: normalizedImageStorageKey ?? null,
		imageUrl: normalizedImageUrl ?? null,
		name: input.name,
		preparationTimeMinutes: input.preparationTimeMinutes ?? null,
		priceInCents: input.priceInCents,
	};

	await deps.createMenuItemRecord(item);
	return item;
}

export async function updateMenuItem(
	deps: {
		findCategoryById: (
			categoryId: string,
		) => Promise<CatalogCategoryRecord | null> | CatalogCategoryRecord | null;
		findMembershipByUserId: (
			userId: string,
		) => Promise<StaffHotelMembership | null> | StaffHotelMembership | null;
		findMenuItemById: (
			itemId: string,
		) => Promise<CatalogMenuItemRecord | null> | CatalogMenuItemRecord | null;
		updateMenuItemRecord: (
			itemId: string,
			item: Partial<CatalogMenuItemRecord>,
		) => Promise<void> | void;
	},
	input: {
		available?: boolean;
		categoryId?: string;
		description?: string;
		imageStorageKey?: string;
		imageUrl?: string;
		itemId: string;
		name?: string;
		preparationTimeMinutes?: number;
		priceInCents?: number;
		userId: string;
	},
) {
	const item = await deps.findMenuItemById(input.itemId);
	if (!item) {
		throw new CatalogAdminServiceError(
			"ITEM_NOT_FOUND",
			"Menu item was not found",
		);
	}

	const membership = await deps.findMembershipByUserId(input.userId);
	let nextImageUrl: string | null | undefined;
	let nextImageStorageKey: string | null | undefined;
	try {
		ensureCatalogAccess(input.userId, membership);
		assertUserCanManageHotel(input.userId, membership, item.hotelId);
		if (input.priceInCents !== undefined) {
			assertNonNegativePrice(input.priceInCents);
		}
		nextImageUrl =
			input.imageUrl === undefined
				? item.imageUrl
				: normalizeImageUrl(input.imageUrl);
		nextImageStorageKey =
			input.imageStorageKey === undefined
				? item.imageStorageKey
				: normalizeImageStorageKey(input.imageStorageKey);
	} catch (error) {
		toCatalogAdminServiceError(error);
	}

	if (input.categoryId) {
		const category = await deps.findCategoryById(input.categoryId);
		if (!category) {
			throw new CatalogAdminServiceError(
				"CATEGORY_NOT_FOUND",
				"Category was not found",
			);
		}

		try {
			assertSameHotel(category.hotelId, item.hotelId, "Category");
		} catch (error) {
			toCatalogAdminServiceError(error);
		}
	}

	await deps.updateMenuItemRecord(input.itemId, {
		available: input.available ?? item.available,
		categoryId: input.categoryId ?? item.categoryId,
		description: input.description ?? item.description,
		imageStorageKey: nextImageStorageKey,
		imageUrl: nextImageUrl,
		name: input.name ?? item.name,
		preparationTimeMinutes:
			input.preparationTimeMinutes ?? item.preparationTimeMinutes,
		priceInCents: input.priceInCents ?? item.priceInCents,
	});

	return {
		...item,
		available: input.available ?? item.available,
		categoryId: input.categoryId ?? item.categoryId,
		description: input.description ?? item.description,
		imageStorageKey: nextImageStorageKey,
		imageUrl: nextImageUrl,
		name: input.name ?? item.name,
		preparationTimeMinutes:
			input.preparationTimeMinutes ?? item.preparationTimeMinutes,
		priceInCents: input.priceInCents ?? item.priceInCents,
	};
}

export async function toggleMenuItemAvailability(
	deps: {
		findMembershipByUserId: (
			userId: string,
		) => Promise<StaffHotelMembership | null> | StaffHotelMembership | null;
		findMenuItemById: (
			itemId: string,
		) => Promise<CatalogMenuItemRecord | null> | CatalogMenuItemRecord | null;
		updateMenuItemRecord: (
			itemId: string,
			item: Partial<CatalogMenuItemRecord>,
		) => Promise<void> | void;
	},
	input: {
		itemId: string;
		userId: string;
	},
) {
	const item = await deps.findMenuItemById(input.itemId);
	if (!item) {
		throw new CatalogAdminServiceError(
			"ITEM_NOT_FOUND",
			"Menu item was not found",
		);
	}

	const membership = await deps.findMembershipByUserId(input.userId);
	try {
		ensureCatalogAccess(input.userId, membership);
		assertUserCanManageHotel(input.userId, membership, item.hotelId);
	} catch (error) {
		toCatalogAdminServiceError(error);
	}

	const nextAvailable = !item.available;
	await deps.updateMenuItemRecord(input.itemId, { available: nextAvailable });

	return {
		...item,
		available: nextAvailable,
	};
}
