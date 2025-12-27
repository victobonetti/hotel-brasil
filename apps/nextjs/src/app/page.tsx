import { Suspense } from "react";
import { AuthShowcase } from "./_components/auth-showcase";

export default function HomePage() {
	return (
		<main className="container h-screen py-16">
			<div className="flex flex-col items-center justify-center gap-4">
				<Suspense>
					<AuthShowcase />
				</Suspense>
			</div>
		</main>
	);
}
