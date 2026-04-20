import { db } from "@nowait24/db/client";

import { getSession } from "~/auth/server";

export interface StaffMembershipContext {
	hotelId: string;
	hotelName: string;
	role: "admin" | "frontdesk" | "kitchen" | "manager";
}

export interface StaffAccessContext {
	membership: StaffMembershipContext | null;
	needsOnboarding: boolean;
	session: Awaited<ReturnType<typeof getSession>>;
	userName?: string;
}

export async function getStaffAccessContext(): Promise<StaffAccessContext> {
	const session = await getSession();

	if (!session) {
		return {
			membership: null,
			needsOnboarding: false,
			session: null,
		};
	}

	const membership = await db.query.staffUserHotels.findFirst({
		columns: {
			hotelId: true,
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

	return {
		membership: membership
			? {
					hotelId: membership.hotelId,
					hotelName: membership.hotel.name,
					role: membership.role,
				}
			: null,
		needsOnboarding: !membership,
		session,
		userName: session.user.name ?? session.user.email,
	};
}
