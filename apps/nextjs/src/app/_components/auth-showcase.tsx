import { db } from "@nowait24/db/client";
import { Badge } from "@nowait24/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@nowait24/ui/card";

import { auth, getSession } from "~/auth/server";
import { getStaffAccessSummary } from "./auth-access";
import { GoogleSignInButton } from "./google-sign-in-button";
import { AuthShowcaseSignedInView } from "./auth-showcase-view";
import { ShieldIcon } from "./ui-icons";

export async function AuthShowcase() {
	const session = await getSession();

	if (!session) {
		return (
			<Card className="border-primary/15 bg-card/88 shadow-lg shadow-primary/10 backdrop-blur-sm">
				<CardHeader className="space-y-3">
					<Badge className="w-fit rounded-full px-3 py-1" variant="outline">
						Acesso da equipe
					</Badge>
					<CardTitle className="text-2xl">Entrar no painel do hotel</CardTitle>
					<CardDescription>
						Use sua conta Google autorizada para acessar pedidos, catalogo e
						operacao.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="rounded-2xl border border-primary/10 bg-primary/[0.04] p-4">
						<p className="flex items-center gap-2 font-medium text-primary text-sm">
							<ShieldIcon className="size-4" />
							Autenticacao segura
						</p>
						<p className="mt-1 text-muted-foreground text-sm">
							O acesso do staff respeita o vinculo da conta com cada hotel.
						</p>
					</div>
					<GoogleSignInButton />
				</CardContent>
			</Card>
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
