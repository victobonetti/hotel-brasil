import { redirect } from "next/navigation";
import { Suspense } from "react";

import { AuthShowcase } from "./_components/auth-showcase";
import { HomeLandingView } from "./_components/home-landing-view";
import { getStaffAccessContext } from "./_components/staff-access-context";

async function HomePageContent() {
	const access = await getStaffAccessContext();

	if (access.session && access.needsOnboarding) {
		redirect("/staff/onboarding");
	}

	return (
		<HomeLandingView
			authSlot={
				<Suspense>
					<AuthShowcase />
				</Suspense>
			}
		/>
	);
}

export default function HomePage() {
	return (
		<Suspense fallback={null}>
			<HomePageContent />
		</Suspense>
	);
}
