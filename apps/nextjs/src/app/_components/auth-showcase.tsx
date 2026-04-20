import { getStaffAccessSummary } from "./auth-access";
import { AuthShowcaseSignedInView } from "./auth-showcase-view";
import { GoogleSignInButton } from "./google-sign-in-button";
import { getStaffAccessContext } from "./staff-access-context";

export async function AuthShowcase() {
	const accessContext = await getStaffAccessContext();
	const { session } = accessContext;

	if (!session) {
		return (
			<GoogleSignInButton
				className="h-11 rounded-full bg-[#251714] px-5 text-white hover:bg-[#1c100d]"
				label="Entrar no painel"
				size="default"
			/>
		);
	}

	const access = getStaffAccessSummary(
		accessContext.membership
			? {
					hotelName: accessContext.membership.hotelName,
					role: accessContext.membership.role,
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
