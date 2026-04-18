import { db } from "@finchat/db/client";
import { Badge } from "@finchat/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@finchat/ui/card";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth, getSession } from "~/auth/server";
import { getStaffAccessSummary } from "./auth-access";
import { GoogleSignInButton } from "./google-sign-in-button";
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
		<Card className="border-primary/15 bg-card/88 shadow-lg shadow-primary/10 backdrop-blur-sm">
			<CardHeader>
				<CardTitle className="text-2xl">Sessao ativa</CardTitle>
				<CardDescription>Conectado como {session.user.name}</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="rounded-2xl border border-primary/10 bg-primary/[0.04] p-4">
					<p className="flex items-center gap-2 font-medium text-primary text-sm">
						<ShieldIcon className="size-4" />O que voce pode acessar
					</p>
					<p className="mt-1 text-muted-foreground text-sm">
						{access.description}
					</p>
				</div>
				<div className="rounded-2xl border border-primary/10 bg-background/70 p-4">
					<p className="font-medium text-sm">{access.title}</p>
					<div className="mt-3 flex flex-wrap gap-2">
						{access.canAccessOrders ? (
							<Link
								className="inline-flex items-center rounded-md bg-primary px-3 py-2 font-medium text-primary-foreground text-sm transition hover:bg-primary/85"
								href="/staff/orders"
							>
								Abrir pedidos
							</Link>
						) : null}
						{access.canAccessCatalog ? (
							<Link
								className="inline-flex items-center rounded-md border border-border bg-background px-3 py-2 font-medium text-foreground text-sm transition hover:bg-muted"
								href="/staff/menu"
							>
								Categorias do menu
							</Link>
						) : null}
						{access.canAccessCatalog ? (
							<Link
								className="inline-flex items-center rounded-md border border-border bg-background px-3 py-2 font-medium text-foreground text-sm transition hover:bg-muted"
								href="/staff/menu/items"
							>
								Itens do menu
							</Link>
						) : null}
					</div>
					{!access.canAccessOrders ? (
						<p className="mt-3 text-muted-foreground text-sm">
							Depois que sua conta for vinculada a um hotel, esta area vai
							mostrar os atalhos corretos automaticamente.
						</p>
					) : null}
				</div>

				<form>
					<button
						className="inline-flex w-full items-center justify-center rounded-md border border-border bg-background px-4 py-2.5 font-medium text-foreground text-sm transition hover:bg-muted"
						formAction={async () => {
							"use server";
							await auth.api.signOut({
								headers: await headers(),
							});
							redirect("/");
						}}
						type="submit"
					>
						Sair da conta
					</button>
				</form>
			</CardContent>
		</Card>
	);
}
