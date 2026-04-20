import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";

import { users } from "./auth-schema";

export * from "./auth-schema";

export const orderStatusEnum = pgEnum("order_status", [
	"pending",
	"accepted",
	"preparing",
	"out_for_delivery",
	"delivered",
	"cancelled",
]);

export const staffUserHotelRoleEnum = pgEnum("staff_user_hotel_role", [
	"admin",
	"manager",
	"kitchen",
	"frontdesk",
]);

export const hotels = pgTable(
	"hotel",
	{
		active: boolean().notNull().default(true),
		addressLine: text().notNull(),
		city: text().notNull(),
		country: text().notNull(),
		createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
		currency: text().notNull(),
		email: text().notNull(),
		id: text().primaryKey(),
		name: text().notNull(),
		phone: text().notNull(),
		slug: text().notNull(),
		state: text().notNull(),
		timezone: text().notNull(),
		updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [uniqueIndex("hotel_slug_idx").on(table.slug)],
);

export const rooms = pgTable(
	"room",
	{
		active: boolean().notNull().default(true),
		createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
		floor: integer(),
		hotelId: text()
			.notNull()
			.references(() => hotels.id, { onDelete: "cascade" }),
		id: text().primaryKey(),
		label: text().notNull(),
		qrCodeToken: text().notNull(),
		updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		index("room_hotel_id_idx").on(table.hotelId),
		uniqueIndex("room_hotel_label_idx").on(table.hotelId, table.label),
		uniqueIndex("room_qr_code_token_idx").on(table.qrCodeToken),
	],
);

export const menuCategories = pgTable(
	"menu_category",
	{
		active: boolean().notNull().default(true),
		createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
		description: text(),
		hotelId: text()
			.notNull()
			.references(() => hotels.id, { onDelete: "cascade" }),
		id: text().primaryKey(),
		name: text().notNull(),
		sortOrder: integer().notNull().default(0),
		updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [index("menu_category_hotel_id_idx").on(table.hotelId)],
);

export const menuItems = pgTable(
	"menu_item",
	{
		available: boolean().notNull().default(true),
		categoryId: text()
			.notNull()
			.references(() => menuCategories.id, { onDelete: "restrict" }),
		createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
		description: text(),
		hotelId: text()
			.notNull()
			.references(() => hotels.id, { onDelete: "cascade" }),
		id: text().primaryKey(),
		imageStorageKey: text(),
		imageUrl: text(),
		name: text().notNull(),
		preparationTimeMinutes: integer(),
		priceInCents: integer().notNull(),
		updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		index("menu_item_hotel_id_idx").on(table.hotelId),
		index("menu_item_category_id_idx").on(table.categoryId),
	],
);

export const guestSessions = pgTable(
	"guest_session",
	{
		createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
		expiresAt: timestamp({ withTimezone: true }).notNull(),
		hotelId: text()
			.notNull()
			.references(() => hotels.id, { onDelete: "cascade" }),
		id: text().primaryKey(),
		roomId: text()
			.notNull()
			.references(() => rooms.id, { onDelete: "cascade" }),
		token: text().notNull(),
	},
	(table) => [
		index("guest_session_hotel_id_idx").on(table.hotelId),
		index("guest_session_room_id_idx").on(table.roomId),
		uniqueIndex("guest_session_token_idx").on(table.token),
	],
);

export const orders = pgTable(
	"order",
	{
		acceptedAt: timestamp({ withTimezone: true }),
		cancelledAt: timestamp({ withTimezone: true }),
		createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
		deliveredAt: timestamp({ withTimezone: true }),
		deliveringAt: timestamp({ withTimezone: true }),
		guestSessionId: text()
			.notNull()
			.references(() => guestSessions.id, { onDelete: "restrict" }),
		hotelId: text()
			.notNull()
			.references(() => hotels.id, { onDelete: "cascade" }),
		id: text().primaryKey(),
		notes: text(),
		placedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
		preparingAt: timestamp({ withTimezone: true }),
		roomId: text()
			.notNull()
			.references(() => rooms.id, { onDelete: "restrict" }),
		status: orderStatusEnum().notNull().default("pending"),
		totalAmountInCents: integer().notNull(),
		updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		index("order_hotel_id_idx").on(table.hotelId),
		index("order_room_id_idx").on(table.roomId),
		index("order_status_idx").on(table.status),
		index("order_placed_at_idx").on(table.placedAt),
	],
);

export const orderItems = pgTable(
	"order_item",
	{
		id: text().primaryKey(),
		itemNameSnapshot: text().notNull(),
		lineTotalInCents: integer().notNull(),
		menuItemId: text()
			.notNull()
			.references(() => menuItems.id, { onDelete: "restrict" }),
		notes: text(),
		orderId: text()
			.notNull()
			.references(() => orders.id, { onDelete: "cascade" }),
		quantity: integer().notNull(),
		unitPriceSnapshotInCents: integer().notNull(),
	},
	(table) => [
		index("order_item_order_id_idx").on(table.orderId),
		index("order_item_menu_item_id_idx").on(table.menuItemId),
	],
);

export const orderStatusHistories = pgTable(
	"order_status_history",
	{
		changedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
		changedByUserId: text().references(() => users.id, {
			onDelete: "set null",
		}),
		fromStatus: orderStatusEnum(),
		id: text().primaryKey(),
		orderId: text()
			.notNull()
			.references(() => orders.id, { onDelete: "cascade" }),
		reason: text(),
		toStatus: orderStatusEnum().notNull(),
	},
	(table) => [index("order_status_history_order_id_idx").on(table.orderId)],
);

export const staffUserHotels = pgTable(
	"staff_user_hotel",
	{
		createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
		hotelId: text()
			.notNull()
			.references(() => hotels.id, { onDelete: "cascade" }),
		id: text().primaryKey(),
		role: staffUserHotelRoleEnum().notNull(),
		userId: text()
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
	},
	(table) => [
		index("staff_user_hotel_hotel_id_idx").on(table.hotelId),
		index("staff_user_hotel_user_id_idx").on(table.userId),
		uniqueIndex("staff_user_hotel_unique_membership_idx").on(
			table.userId,
			table.hotelId,
		),
	],
);

export const hotelsRelations = relations(hotels, ({ many }) => ({
	guestSessions: many(guestSessions),
	menuCategories: many(menuCategories),
	menuItems: many(menuItems),
	orders: many(orders),
	rooms: many(rooms),
	staffMembers: many(staffUserHotels),
}));

export const roomsRelations = relations(rooms, ({ many, one }) => ({
	guestSessions: many(guestSessions),
	hotel: one(hotels, {
		fields: [rooms.hotelId],
		references: [hotels.id],
	}),
	orders: many(orders),
}));

export const menuCategoriesRelations = relations(
	menuCategories,
	({ many, one }) => ({
		hotel: one(hotels, {
			fields: [menuCategories.hotelId],
			references: [hotels.id],
		}),
		items: many(menuItems),
	}),
);

export const menuItemsRelations = relations(menuItems, ({ many, one }) => ({
	category: one(menuCategories, {
		fields: [menuItems.categoryId],
		references: [menuCategories.id],
	}),
	hotel: one(hotels, {
		fields: [menuItems.hotelId],
		references: [hotels.id],
	}),
	orderItems: many(orderItems),
}));

export const guestSessionsRelations = relations(
	guestSessions,
	({ many, one }) => ({
		hotel: one(hotels, {
			fields: [guestSessions.hotelId],
			references: [hotels.id],
		}),
		orders: many(orders),
		room: one(rooms, {
			fields: [guestSessions.roomId],
			references: [rooms.id],
		}),
	}),
);

export const ordersRelations = relations(orders, ({ many, one }) => ({
	guestSession: one(guestSessions, {
		fields: [orders.guestSessionId],
		references: [guestSessions.id],
	}),
	hotel: one(hotels, {
		fields: [orders.hotelId],
		references: [hotels.id],
	}),
	items: many(orderItems),
	room: one(rooms, {
		fields: [orders.roomId],
		references: [rooms.id],
	}),
	statusHistory: many(orderStatusHistories),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
	menuItem: one(menuItems, {
		fields: [orderItems.menuItemId],
		references: [menuItems.id],
	}),
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.id],
	}),
}));

export const orderStatusHistoriesRelations = relations(
	orderStatusHistories,
	({ one }) => ({
		changedByUser: one(users, {
			fields: [orderStatusHistories.changedByUserId],
			references: [users.id],
		}),
		order: one(orders, {
			fields: [orderStatusHistories.orderId],
			references: [orders.id],
		}),
	}),
);

export const staffUserHotelsRelations = relations(
	staffUserHotels,
	({ one }) => ({
		hotel: one(hotels, {
			fields: [staffUserHotels.hotelId],
			references: [hotels.id],
		}),
		user: one(users, {
			fields: [staffUserHotels.userId],
			references: [users.id],
		}),
	}),
);

export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];
export type StaffUserHotelRole =
	(typeof staffUserHotelRoleEnum.enumValues)[number];
