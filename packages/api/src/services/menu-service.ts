export type GuestSessionSummary = {
	expiresAt: Date;
	hotelId: string;
	id: string;
	roomId: string;
	token: string;
};

export type MenuCategorySummary = {
	active: boolean;
	description: string | null;
	hotelId: string;
	id: string;
	name: string;
	sortOrder: number;
};

export type MenuItemSummary = {
	available: boolean;
	categoryId: string;
	description: string | null;
	hotelId: string;
	id: string;
	imageUrl: string | null;
	name: string;
	preparationTimeMinutes: number | null;
	priceInCents: number;
};

export type MenuCategoryWithItems = {
	description: string | null;
	id: string;
	items: MenuItemView[];
	name: string;
	sortOrder: number;
};

export type MenuItemView = {
	description: string | null;
	id: string;
	imageUrl: string | null;
	name: string;
	preparationTimeMinutes: number | null;
	priceInCents: number;
};

export type GuestMenuView = {
	categories: MenuCategoryWithItems[];
	guestSession: {
		expiresAt: Date;
		hotelId: string;
		id: string;
		roomId: string;
		token: string;
	};
};

type GetMenuForGuestSessionDeps = {
	findGuestSessionByToken: (
		token: string,
	) => Promise<GuestSessionSummary | null> | GuestSessionSummary | null;
	listCategoriesByHotel: (
		hotelId: string,
	) => Promise<MenuCategorySummary[]> | MenuCategorySummary[];
	listItemsByHotel: (
		hotelId: string,
	) => Promise<MenuItemSummary[]> | MenuItemSummary[];
	now?: () => Date;
};

export class MenuServiceError extends Error {
	constructor(
		public readonly code:
			| "GUEST_SESSION_EXPIRED"
			| "GUEST_SESSION_NOT_FOUND",
		message: string,
	) {
		super(message);
		this.name = "MenuServiceError";
	}
}

function sortCategories(categories: MenuCategorySummary[]) {
	return [...categories].sort((left, right) => {
		if (left.sortOrder !== right.sortOrder) {
			return left.sortOrder - right.sortOrder;
		}

		return left.name.localeCompare(right.name);
	});
}

function sortItems(items: MenuItemSummary[]) {
	return [...items].sort((left, right) => left.name.localeCompare(right.name));
}

export function listCategoriesByHotel(
	categories: MenuCategorySummary[],
	hotelId: string,
) {
	return sortCategories(
		categories.filter((category) => category.hotelId === hotelId && category.active),
	);
}

export function listAvailableItems(
	items: MenuItemSummary[],
	hotelId: string,
	validCategoryIds?: Iterable<string>,
) {
	const categoryIds = validCategoryIds ? new Set(validCategoryIds) : null;

	return sortItems(
		items.filter((item) => {
			if (item.hotelId !== hotelId || !item.available) {
				return false;
			}

			if (categoryIds && !categoryIds.has(item.categoryId)) {
				return false;
			}

			return true;
		}),
	);
}

export async function getMenuForGuestSession(
	deps: GetMenuForGuestSessionDeps,
	input: { guestSessionToken: string },
): Promise<GuestMenuView> {
	const guestSession = await deps.findGuestSessionByToken(input.guestSessionToken);
	if (!guestSession) {
		throw new MenuServiceError(
			"GUEST_SESSION_NOT_FOUND",
			"Guest session token is invalid",
		);
	}

	const now = deps.now?.() ?? new Date();
	if (guestSession.expiresAt <= now) {
		throw new MenuServiceError(
			"GUEST_SESSION_EXPIRED",
			"Guest session has expired",
		);
	}

	const categories = listCategoriesByHotel(
		await deps.listCategoriesByHotel(guestSession.hotelId),
		guestSession.hotelId,
	);
	const items = listAvailableItems(
		await deps.listItemsByHotel(guestSession.hotelId),
		guestSession.hotelId,
		categories.map((category) => category.id),
	);

	const itemsByCategoryId = new Map<string, MenuItemView[]>();
	for (const item of items) {
		const categoryItems = itemsByCategoryId.get(item.categoryId) ?? [];
		categoryItems.push({
			description: item.description,
			id: item.id,
			imageUrl: item.imageUrl,
			name: item.name,
			preparationTimeMinutes: item.preparationTimeMinutes,
			priceInCents: item.priceInCents,
		});
		itemsByCategoryId.set(item.categoryId, categoryItems);
	}

	return {
		categories: categories.map((category) => ({
			description: category.description,
			id: category.id,
			items: itemsByCategoryId.get(category.id) ?? [],
			name: category.name,
			sortOrder: category.sortOrder,
		})),
		guestSession: {
			expiresAt: guestSession.expiresAt,
			hotelId: guestSession.hotelId,
			id: guestSession.id,
			roomId: guestSession.roomId,
			token: guestSession.token,
		},
	};
}
