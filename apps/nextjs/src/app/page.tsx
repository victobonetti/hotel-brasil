import { Suspense } from "react";

import { AuthShowcase } from "./_components/auth-showcase";
import { HomeLandingView } from "./_components/home-landing-view";

export default function HomePage() {
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
