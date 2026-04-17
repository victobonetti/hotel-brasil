import { describe, expect, test } from "bun:test";

import {
	createGuestSessionFromRoomToken,
	refreshGuestSession,
	resolveGuestSession,
} from "./guest-session-service";

const room = {
	hotelActive: true,
	hotelId: "hotel-1",
	qrCodeToken: "room-token-1",
	roomActive: true,
	roomId: "room-101",
};

const activeSession = {
	expiresAt: new Date("2099-04-17T12:00:00.000Z"),
	hotelActive: true,
	hotelId: "hotel-1",
	id: "session-1",
	roomActive: true,
	roomId: "room-101",
	token: "guest-token-1",
};

describe("createGuestSessionFromRoomToken", () => {
	test("reuses an active session for the same room", async () => {
		const session = await createGuestSessionFromRoomToken(
			{
				createGuestSession: () => undefined,
				findActiveGuestSessionByRoomId: () => activeSession,
				findGuestSessionByToken: () => null,
				findRoomByQrCodeToken: () => room,
				now: () => new Date("2099-04-16T10:00:00.000Z"),
				updateGuestSessionExpiry: () => undefined,
			},
			{ roomToken: "room-token-1" },
		);

		expect(session.token).toBe("guest-token-1");
	});

	test("creates a new session when there is no active one", async () => {
		let createdToken: string | undefined;

		const session = await createGuestSessionFromRoomToken(
			{
				createGuestSession: (created) => {
					createdToken = created.token;
				},
				findActiveGuestSessionByRoomId: () => null,
				findGuestSessionByToken: () => null,
				findRoomByQrCodeToken: () => room,
				now: () => new Date("2099-04-16T10:00:00.000Z"),
				updateGuestSessionExpiry: () => undefined,
			},
			{ roomToken: "room-token-1" },
		);

		expect(session.token).toBe(createdToken);
		expect(session.roomId).toBe("room-101");
		expect(session.hotelId).toBe("hotel-1");
	});

	test("fails for invalid or inactive room token", async () => {
		await expect(
			createGuestSessionFromRoomToken(
				{
					createGuestSession: () => undefined,
					findActiveGuestSessionByRoomId: () => null,
					findGuestSessionByToken: () => null,
					findRoomByQrCodeToken: () => null,
					updateGuestSessionExpiry: () => undefined,
				},
				{ roomToken: "missing" },
			),
		).rejects.toMatchObject({ code: "ROOM_TOKEN_NOT_FOUND" });

		await expect(
			createGuestSessionFromRoomToken(
				{
					createGuestSession: () => undefined,
					findActiveGuestSessionByRoomId: () => null,
					findGuestSessionByToken: () => null,
					findRoomByQrCodeToken: () => ({ ...room, roomActive: false }),
					updateGuestSessionExpiry: () => undefined,
				},
				{ roomToken: "room-token-1" },
			),
		).rejects.toMatchObject({ code: "ROOM_INACTIVE" });
	});
});

describe("resolveGuestSession", () => {
	test("returns the guest session context", async () => {
		await expect(
			resolveGuestSession(
				{
					createGuestSession: () => undefined,
					findActiveGuestSessionByRoomId: () => null,
					findGuestSessionByToken: () => activeSession,
					findRoomByQrCodeToken: () => null,
					updateGuestSessionExpiry: () => undefined,
				},
				{ guestSessionToken: "guest-token-1" },
			),
		).resolves.toEqual(activeSession);
	});

	test("fails when the token is invalid or expired", async () => {
		await expect(
			resolveGuestSession(
				{
					createGuestSession: () => undefined,
					findActiveGuestSessionByRoomId: () => null,
					findGuestSessionByToken: () => null,
					findRoomByQrCodeToken: () => null,
					updateGuestSessionExpiry: () => undefined,
				},
				{ guestSessionToken: "missing" },
			),
		).rejects.toMatchObject({ code: "GUEST_SESSION_NOT_FOUND" });

		await expect(
			resolveGuestSession(
				{
					createGuestSession: () => undefined,
					findActiveGuestSessionByRoomId: () => null,
					findGuestSessionByToken: () => ({
						...activeSession,
						expiresAt: new Date("2020-04-15T10:00:00.000Z"),
					}),
					findRoomByQrCodeToken: () => null,
					now: () => new Date("2099-04-16T10:00:00.000Z"),
					updateGuestSessionExpiry: () => undefined,
				},
				{ guestSessionToken: "guest-token-1" },
			),
		).rejects.toMatchObject({ code: "GUEST_SESSION_EXPIRED" });
	});
});

describe("refreshGuestSession", () => {
	test("extends the session expiry", async () => {
		let nextExpiry: Date | undefined;

		const session = await refreshGuestSession(
			{
				createGuestSession: () => undefined,
				findActiveGuestSessionByRoomId: () => null,
				findGuestSessionByToken: () => activeSession,
				findRoomByQrCodeToken: () => null,
				now: () => new Date("2099-04-16T10:00:00.000Z"),
				updateGuestSessionExpiry: (_token, expiresAt) => {
					nextExpiry = expiresAt;
				},
			},
			{ guestSessionToken: "guest-token-1" },
		);

		expect(session.expiresAt).toEqual(nextExpiry);
	});
});
