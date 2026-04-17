import { describe, expect, test } from "bun:test";

import {
	createRoom,
	listRoomsForStaff,
	regenerateRoomToken,
	updateRoom,
} from "./room-admin-service";

const managerMembership = {
	hotelId: "hotel-1",
	role: "manager" as const,
	userId: "user-1",
};

const kitchenMembership = {
	hotelId: "hotel-1",
	role: "kitchen" as const,
	userId: "user-2",
};

describe("listRoomsForStaff", () => {
	test("returns a paginated response with rooms from the staff hotel", async () => {
		const records = Array.from({ length: 11 }, (_, index) => ({
			active: true,
			floor: 3,
			hotelId: "hotel-1",
			id: `room-${index + 1}`,
			label: `${301 + index}`,
			qrCodeToken: `token-${index + 1}`,
		}));
		const rooms = await listRoomsForStaff(
			{
				countRoomsByHotelId: () => records.length,
				findMembershipByUserId: () => managerMembership,
				listRoomsByHotelId: (_hotelId, input) =>
					records.slice(input.offset, input.offset + input.limit),
			},
			{ page: 2, pageSize: 10, userId: "user-1" },
		);

		expect(rooms.items).toEqual([
			expect.objectContaining({
				hotelId: "hotel-1",
				id: "room-11",
			}),
		]);
		expect(rooms.pagination).toMatchObject({
			hasNextPage: false,
			hasPreviousPage: true,
			page: 2,
			pageSize: 10,
			totalItems: 11,
			totalPages: 2,
		});
	});

	test("rejects staff without the required role", async () => {
		await expect(
			listRoomsForStaff(
				{
					countRoomsByHotelId: () => 0,
					findMembershipByUserId: () => kitchenMembership,
					listRoomsByHotelId: () => [],
				},
				{ page: 1, pageSize: 10, userId: "user-2" },
			),
		).rejects.toMatchObject({ code: "UNAUTHORIZED_ROLE" });
	});
});

describe("createRoom", () => {
	test("creates a room with a generated token", async () => {
		const room = await createRoom(
			{
				createRoomRecord: () => undefined,
				findMembershipByUserId: () => managerMembership,
				generateRoomToken: () => "generated-room-token",
				listRoomsByHotelId: () => [],
			},
			{
				floor: 3,
				label: "301",
				userId: "user-1",
			},
		);

		expect(room).toMatchObject({
			active: true,
			floor: 3,
			hotelId: "hotel-1",
			label: "301",
			qrCodeToken: "generated-room-token",
		});
	});

	test("rejects duplicate labels within the same hotel", async () => {
		await expect(
			createRoom(
				{
					createRoomRecord: () => undefined,
					findMembershipByUserId: () => managerMembership,
					generateRoomToken: () => "generated-room-token",
					listRoomsByHotelId: () => [
						{
							active: true,
							floor: 3,
							hotelId: "hotel-1",
							id: "room-301",
							label: "301",
							qrCodeToken: "token-301",
						},
					],
				},
				{
					label: "301",
					userId: "user-1",
				},
			),
		).rejects.toMatchObject({ code: "ROOM_LABEL_CONFLICT" });
	});

	test("rejects a user without hotel membership", async () => {
		await expect(
			createRoom(
				{
					createRoomRecord: () => undefined,
					findMembershipByUserId: () => null,
					generateRoomToken: () => "generated-room-token",
					listRoomsByHotelId: () => [],
				},
				{
					label: "301",
					userId: "missing-user",
				},
			),
		).rejects.toMatchObject({ code: "STAFF_MEMBERSHIP_REQUIRED" });
	});
});

describe("updateRoom", () => {
	test("updates label, floor and active fields", async () => {
		const room = await updateRoom(
			{
				findMembershipByUserId: () => managerMembership,
				findRoomById: () => ({
					active: true,
					floor: 3,
					hotelId: "hotel-1",
					id: "room-301",
					label: "301",
					qrCodeToken: "token-301",
				}),
				listRoomsByHotelId: () => [],
				updateRoomRecord: () => undefined,
			},
			{
				active: false,
				floor: 4,
				label: "401",
				roomId: "room-301",
				userId: "user-1",
			},
		);

		expect(room).toMatchObject({
			active: false,
			floor: 4,
			label: "401",
		});
	});

	test("blocks cross-hotel access", async () => {
		await expect(
			updateRoom(
				{
					findMembershipByUserId: () => managerMembership,
					findRoomById: () => ({
						active: true,
						floor: 7,
						hotelId: "hotel-2",
						id: "room-701",
						label: "701",
						qrCodeToken: "token-701",
					}),
					listRoomsByHotelId: () => [],
					updateRoomRecord: () => undefined,
				},
				{
					label: "702",
					roomId: "room-701",
					userId: "user-1",
				},
			),
		).rejects.toMatchObject({ code: "TENANT_MISMATCH" });
	});
});

describe("regenerateRoomToken", () => {
	test("regenerates the room token without changing the room id", async () => {
		const room = await regenerateRoomToken(
			{
				findMembershipByUserId: () => managerMembership,
				findRoomById: () => ({
					active: true,
					floor: 3,
					hotelId: "hotel-1",
					id: "room-301",
					label: "301",
					qrCodeToken: "token-301",
				}),
				generateRoomToken: () => "token-302",
				updateRoomRecord: () => undefined,
			},
			{
				roomId: "room-301",
				userId: "user-1",
			},
		);

		expect(room.id).toBe("room-301");
		expect(room.qrCodeToken).toBe("token-302");
	});
});
