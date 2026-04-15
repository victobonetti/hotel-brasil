import { randomUUID } from "node:crypto";

import {
	assertGuestSessionIsActive,
	assertRoomCanCreateGuestSession,
	generateGuestSessionToken,
	type GuestSessionContext,
	type RoomTokenContext,
} from "../domain/guest-session";

export type PersistedGuestSession = {
	createdAt: Date;
	expiresAt: Date;
	hotelId: string;
	id: string;
	roomId: string;
	token: string;
};

type GuestSessionServiceDeps = {
	createGuestSession: (
		session: PersistedGuestSession,
	) => Promise<void> | void;
	findActiveGuestSessionByRoomId: (
		roomId: string,
		now: Date,
	) => Promise<GuestSessionContext | null> | GuestSessionContext | null;
	findGuestSessionByToken: (
		token: string,
	) => Promise<GuestSessionContext | null> | GuestSessionContext | null;
	findRoomByQrCodeToken: (
		qrCodeToken: string,
	) => Promise<RoomTokenContext | null> | RoomTokenContext | null;
	now?: () => Date;
	updateGuestSessionExpiry: (
		token: string,
		expiresAt: Date,
	) => Promise<void> | void;
};

export class GuestSessionServiceError extends Error {
	constructor(
		public readonly code:
			| "GUEST_SESSION_EXPIRED"
			| "GUEST_SESSION_NOT_FOUND"
			| "HOTEL_INACTIVE"
			| "ROOM_INACTIVE"
			| "ROOM_TOKEN_NOT_FOUND",
		message: string,
	) {
		super(message);
		this.name = "GuestSessionServiceError";
	}
}

function toGuestSessionServiceError(error: unknown): never {
	if (error instanceof Error) {
		if (error.message.includes("expired")) {
			throw new GuestSessionServiceError("GUEST_SESSION_EXPIRED", error.message);
		}

		if (error.message.includes("Room is inactive")) {
			throw new GuestSessionServiceError("ROOM_INACTIVE", error.message);
		}

		if (error.message.includes("Hotel is inactive")) {
			throw new GuestSessionServiceError("HOTEL_INACTIVE", error.message);
		}
	}

	throw error;
}

function buildExpiry(now: Date) {
	return new Date(now.getTime() + 1000 * 60 * 60 * 4);
}

export async function resolveGuestSession(
	deps: GuestSessionServiceDeps,
	input: { guestSessionToken: string },
) {
	const session = await deps.findGuestSessionByToken(input.guestSessionToken);
	if (!session) {
		throw new GuestSessionServiceError(
			"GUEST_SESSION_NOT_FOUND",
			"Guest session token is invalid",
		);
	}

	try {
		assertGuestSessionIsActive(session);
	} catch (error) {
		toGuestSessionServiceError(error);
	}

	return session;
}

export async function createGuestSessionFromRoomToken(
	deps: GuestSessionServiceDeps,
	input: { roomToken: string },
) {
	const room = await deps.findRoomByQrCodeToken(input.roomToken);
	if (!room) {
		throw new GuestSessionServiceError(
			"ROOM_TOKEN_NOT_FOUND",
			"Room token is invalid",
		);
	}

	try {
		assertRoomCanCreateGuestSession(room);
	} catch (error) {
		toGuestSessionServiceError(error);
	}

	const now = deps.now?.() ?? new Date();
	const activeSession = await deps.findActiveGuestSessionByRoomId(room.roomId, now);
	if (activeSession) {
		return activeSession;
	}

	const session: PersistedGuestSession = {
		createdAt: now,
		expiresAt: buildExpiry(now),
		hotelId: room.hotelId,
		id: randomUUID(),
		roomId: room.roomId,
		token: generateGuestSessionToken(),
	};

	await deps.createGuestSession(session);
	return session;
}

export async function refreshGuestSession(
	deps: GuestSessionServiceDeps,
	input: { guestSessionToken: string },
) {
	const session = await resolveGuestSession(deps, input);
	const expiresAt = buildExpiry(deps.now?.() ?? new Date());
	await deps.updateGuestSessionExpiry(session.token, expiresAt);

	return {
		...session,
		expiresAt,
	};
}
