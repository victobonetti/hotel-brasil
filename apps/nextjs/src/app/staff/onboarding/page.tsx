import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getStaffAccessContext } from "~/app/_components/staff-access-context";
import { StaffOnboardingPage } from "./_components/staff-onboarding-page";

async function StaffOnboardingContent() {
	const access = await getStaffAccessContext();

	if (!access.session) {
		redirect("/");
	}

	if (access.membership) {
		redirect("/staff/orders");
	}

	return <StaffOnboardingPage userName={access.userName} />;
}

export default function StaffOnboardingRoute() {
	return (
		<Suspense fallback={null}>
			<StaffOnboardingContent />
		</Suspense>
	);
}
