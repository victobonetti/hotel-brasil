import type { Drizzle } from "@nowait24/db/client";

export async function findStaffMembershipByUserId(db: Drizzle, userId: string) {
	const membership = await db.query.staffUserHotels.findFirst({
		columns: { hotelId: true, role: true, userId: true },
		where: (table, operators) => operators.eq(table.userId, userId),
	});

	return membership ?? null;
}

export async function findStaffMembershipWithHotelByUserId(
	db: Drizzle,
	userId: string,
) {
	const membership = await db.query.staffUserHotels.findFirst({
		columns: { hotelId: true, role: true, userId: true },
		where: (table, operators) => operators.eq(table.userId, userId),
		with: {
			hotel: {
				columns: {
					name: true,
				},
			},
		},
	});

	return membership ?? null;
}
