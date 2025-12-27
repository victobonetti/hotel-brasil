import { Button } from "@finchat/ui/button";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth, getSession } from "~/auth/server";

export async function AuthShowcase() {
	const session = await getSession();

	if (!session) {
		return (
			<form>
				<Button
					formAction={async () => {
						"use server";
						await auth.api.signInSocial({
							body: {
								callbackURL: "/",
								provider: "google",
							},
						});
					}}
					size="lg"
					type="submit"
				>
					Sign in with Google
				</Button>
			</form>
		);
	}

	return (
		<div className="flex flex-col items-center justify-center gap-4">
			<p className="text-center text-2xl">
				<span>Logged in as {session.user.name}</span>
			</p>

			<form>
				<Button
					formAction={async () => {
						"use server";
						await auth.api.signOut({
							headers: await headers(),
						});
						redirect("/");
					}}
					size="lg"
					type="submit"
				>
					Sign out
				</Button>
			</form>
		</div>
	);
}
