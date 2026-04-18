import { db } from "@nowait24/db/client";

import { getSession } from "~/auth/server";
import { getStaffAccessSummary } from "./auth-access";
import { AuthShowcaseSignedInView } from "./auth-showcase-view";
import { GoogleSignInButton } from "./google-sign-in-button";

export async function AuthShowcase() {
	const session = await getSession();

	if (!session) {
		return (
			<GoogleSignInButton
				className="h-11 rounded-full bg-[#251714] px-5 text-white hover:bg-[#1c100d]"
				label="Entrar no painel"
				size="default"
			/>
		);
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
	const access = getStaffAccessSummary(
		membership
			? {
					hotelName: membership.hotel.name,
					role: membership.role,
				}
			: null,
	);

	return (
		<AuthShowcaseSignedInView
			access={access}
			userName={session.user.name ?? session.user.email}
		/>
	);
}
