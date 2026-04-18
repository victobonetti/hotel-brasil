import { randomBytes, randomUUID } from "node:crypto";
import { buildPaginationMetadata, type PaginatedResult } from "@nowait24/utils";
import { assertUserCanManageHotel } from "../domain/order";
import type { StaffHotelMembership } from "./order-service";

export interface RoomAdminRecord {
	active: boolean;
	floor: number | null;
	hotelId: string;
	id: string;
	label: string;
	qrCodeToken: string;
}

type RoomAdminRole = "admin" | "manager";
type RoomAdminAccess = StaffHotelMembership & { role: RoomAdminRole };

function generateOpaqueRoomToken() {
	return randomBytes(24).toString("base64url");
}

function assertRoomAdminRole(role: string) {
	if (role !== "admin" && role !== "manager") {
		throw new Error("Only admin or manager can manage rooms");
	}

	return role as RoomAdminRole;
}

function assertNonEmptyRoomLabel(label: string) {
	if (label.trim().length === 0) {
		throw new Error("Room label must not be empty");
	}
}

function assertValidFloor(floor: number | null | undefined) {
	if (floor === undefined || floor === null) {
		return;
	}

	if (!Number.isInteger(floor)) {
		throw new Error("Room floor must be an integer");
	}
}

function assertUniqueRoomLabel(
	rooms: Array<RoomAdminRecord>,
	label: string,
	currentRoomId?: string,
) {
	const normalizedLabel = label.trim().toLowerCase();
	const duplicate = rooms.find(
		(room) =>
			room.id !== currentRoomId &&
			room.label.trim().toLowerCase() === normalizedLabel,
	);

	if (duplicate) {
		throw new Error("Room label already exists in this hotel");
	}
}

function ensureRoomAdminAccess(
	userId: string,
	membership: StaffHotelMembership | null,
) {
	if (!membership) {
		throw new Error("User is not assigned to this hotel");
	}

	assertUserCanManageHotel(userId, membership, membership.hotelId);
	const resolvedMembership = membership as StaffHotelMembership;
	assertRoomAdminRole(resolvedMembership.role);
	return resolvedMembership as RoomAdminAccess;
}

export class RoomAdminServiceError extends Error {
	readonly code:
		| "ROOM_LABEL_CONFLICT"
		| "ROOM_NOT_FOUND"
		| "STAFF_MEMBERSHIP_REQUIRED"
		| "TENANT_MISMATCH"
		| "UNAUTHORIZED_ROLE";

	constructor(
		code:
			| "ROOM_LABEL_CONFLICT"
			| "ROOM_NOT_FOUND"
			| "STAFF_MEMBERSHIP_REQUIRED"
			| "TENANT_MISMATCH"
			| "UNAUTHORIZED_ROLE",
		message: string,
	) {
		super(message);
		this.code = code;
		this.name = "RoomAdminServiceError";
	}
}

function toRoomAdminServiceError(error: unknown): never {
	if (error instanceof Error) {
		if (
			error.message.includes("same hotel") ||
			error.message.includes("another hotel")
		) {
			throw new RoomAdminServiceError("TENANT_MISMATCH", error.message);
		}

		if (
			error.message.includes("not assigned") ||
			error.message.includes("cannot manage another hotel")
		) {
			throw new RoomAdminServiceError(
				"STAFF_MEMBERSHIP_REQUIRED",
				error.message,
			);
		}

		if (error.message.includes("Only admin or manager")) {
			throw new RoomAdminServiceError("UNAUTHORIZED_ROLE", error.message);
		}

		if (error.message.includes("already exists")) {
			throw new RoomAdminServiceError("ROOM_LABEL_CONFLICT", error.message);
		}
	}

	throw error;
}

export async function listRoomsForStaff(
	deps: {
		countRoomsByHotelId: (hotelId: string) => Promise<number> | number;
		findMembershipByUserId: (
			userId: string,
		) => Promise<StaffHotelMembership | null> | StaffHotelMembership | null;
		listRoomsByHotelId: (
			hotelId: string,
			input: { limit: number; offset: number },
		) => Promise<Array<RoomAdminRecord>> | Array<RoomAdminRecord>;
	},
	input: { page?: number; pageSize: number; userId: string },
): Promise<PaginatedResult<RoomAdminRecord>> {
	const membership = await deps.findMembershipByUserId(input.userId);
	let access: RoomAdminAccess;
	try {
		access = ensureRoomAdminAccess(input.userId, membership);
	} catch (error) {
		toRoomAdminServiceError(error);
	}

	const totalItems = await deps.countRoomsByHotelId(access.hotelId);
	const pagination = buildPaginationMetadata({
		page: input.page,
		pageSize: input.pageSize,
		totalItems,
	});

	return {
		items: await deps.listRoomsByHotelId(access.hotelId, {
			limit: pagination.pageSize,
			offset: (pagination.page - 1) * pagination.pageSize,
		}),
		pagination,
	};
}

export async function createRoom(
	deps: {
		createRoomRecord: (room: RoomAdminRecord) => Promise<void> | void;
		findMembershipByUserId: (
			userId: string,
		) => Promise<StaffHotelMembership | null> | StaffHotelMembership | null;
		generateRoomToken?: () => string;
		listRoomsByHotelId: (
			hotelId: string,
		) => Promise<Array<RoomAdminRecord>> | Array<RoomAdminRecord>;
	},
	input: {
		active?: boolean;
		floor?: number;
		label: string;
		userId: string;
	},
) {
	const membership = await deps.findMembershipByUserId(input.userId);
	let access: RoomAdminAccess;
	try {
		access = ensureRoomAdminAccess(input.userId, membership);
		assertNonEmptyRoomLabel(input.label);
		assertValidFloor(input.floor);
	} catch (error) {
		toRoomAdminServiceError(error);
	}

	const existingRooms = await deps.listRoomsByHotelId(access.hotelId);
	try {
		assertUniqueRoomLabel(existingRooms, input.label);
	} catch (error) {
		toRoomAdminServiceError(error);
	}

	const room: RoomAdminRecord = {
		active: input.active ?? true,
		floor: input.floor ?? null,
		hotelId: access.hotelId,
		id: randomUUID(),
		label: input.label.trim(),
		qrCodeToken: deps.generateRoomToken?.() ?? generateOpaqueRoomToken(),
	};

	await deps.createRoomRecord(room);
	return room;
}

export async function updateRoom(
	deps: {
		findMembershipByUserId: (
			userId: string,
		) => Promise<StaffHotelMembership | null> | StaffHotelMembership | null;
		findRoomById: (
			roomId: string,
		) => Promise<RoomAdminRecord | null> | RoomAdminRecord | null;
		listRoomsByHotelId: (
			hotelId: string,
		) => Promise<Array<RoomAdminRecord>> | Array<RoomAdminRecord>;
		updateRoomRecord: (
			roomId: string,
			room: Partial<RoomAdminRecord>,
		) => Promise<void> | void;
	},
	input: {
		active?: boolean;
		floor?: number | null;
		label?: string;
		roomId: string;
		userId: string;
	},
) {
	const room = await deps.findRoomById(input.roomId);
	if (!room) {
		throw new RoomAdminServiceError("ROOM_NOT_FOUND", "Room was not found");
	}

	const membership = await deps.findMembershipByUserId(input.userId);
	try {
		ensureRoomAdminAccess(input.userId, membership);
		assertUserCanManageHotel(input.userId, membership, room.hotelId);
		if (input.label !== undefined) {
			assertNonEmptyRoomLabel(input.label);
		}
		assertValidFloor(input.floor);
	} catch (error) {
		toRoomAdminServiceError(error);
	}

	const nextLabel = input.label?.trim() ?? room.label;
	const rooms = await deps.listRoomsByHotelId(room.hotelId);
	try {
		assertUniqueRoomLabel(rooms, nextLabel, room.id);
	} catch (error) {
		toRoomAdminServiceError(error);
	}

	const update: Partial<RoomAdminRecord> = {
		active: input.active ?? room.active,
		floor: input.floor === undefined ? room.floor : input.floor,
		label: nextLabel,
	};

	await deps.updateRoomRecord(input.roomId, update);

	return {
		...room,
		...update,
	};
}

export async function regenerateRoomToken(
	deps: {
		findMembershipByUserId: (
			userId: string,
		) => Promise<StaffHotelMembership | null> | StaffHotelMembership | null;
		findRoomById: (
			roomId: string,
		) => Promise<RoomAdminRecord | null> | RoomAdminRecord | null;
		generateRoomToken?: () => string;
		updateRoomRecord: (
			roomId: string,
			room: Partial<RoomAdminRecord>,
		) => Promise<void> | void;
	},
	input: {
		roomId: string;
		userId: string;
	},
) {
	const room = await deps.findRoomById(input.roomId);
	if (!room) {
		throw new RoomAdminServiceError("ROOM_NOT_FOUND", "Room was not found");
	}

	const membership = await deps.findMembershipByUserId(input.userId);
	try {
		ensureRoomAdminAccess(input.userId, membership);
		assertUserCanManageHotel(input.userId, membership, room.hotelId);
	} catch (error) {
		toRoomAdminServiceError(error);
	}

	const qrCodeToken = deps.generateRoomToken?.() ?? generateOpaqueRoomToken();
	await deps.updateRoomRecord(input.roomId, { qrCodeToken });

	return {
		...room,
		qrCodeToken,
	};
}
