import { randomBytes } from "node:crypto";

export function generateGuestSessionToken() {
	return randomBytes(24).toString("base64url");
}

export interface GuestSessionContext {
	expiresAt: Date;
	hotelActive: boolean;
	hotelId: string;
	id: string;
	roomActive: boolean;
	roomId: string;
	token: string;
}

export interface RoomTokenContext {
	hotelActive: boolean;
	hotelId: string;
	qrCodeToken: string;
	roomActive: boolean;
	roomId: string;
}

export function assertGuestSessionIsActive(session: {
	expiresAt: Date;
	hotelActive: boolean;
	roomActive: boolean;
}) {
	if (session.expiresAt <= new Date()) {
		throw new Error("Guest session has expired");
	}

	if (!session.roomActive) {
		throw new Error("Room is inactive");
	}

	if (!session.hotelActive) {
		throw new Error("Hotel is inactive");
	}

	return session;
}

export function assertRoomCanCreateGuestSession(room: {
	hotelActive: boolean;
	roomActive: boolean;
}) {
	if (!room.roomActive) {
		throw new Error("Room is inactive");
	}

	if (!room.hotelActive) {
		throw new Error("Hotel is inactive");
	}

	return room;
}
