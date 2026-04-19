import { db } from "@nowait24/db/client";

import { getSession } from "~/auth/server";

export interface StaffShellContext {
	hotelName: string;
	role: "admin" | "frontdesk" | "kitchen" | "manager";
	userName: string;
}

export async function getStaffShellContext(): Promise<StaffShellContext | null> {
	const session = await getSession();

	if (!session) {
		return null;
	}

	const membership = await db.query.staffUserHotels.findFirst({
		columns: {
			role: true,
		},
		where: (table, { eq }) => eq(table.userId, session.user.id),
		with: {
			hotel: {
				columns: {
					name: true,
				},
			},
		},
	});

	if (!membership) {
		return null;
	}

	return {
		hotelName: membership.hotel.name,
		role: membership.role,
		userName: session.user.name ?? session.user.email,
	};
}
