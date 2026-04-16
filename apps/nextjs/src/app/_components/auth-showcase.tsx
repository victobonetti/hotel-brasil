import { Badge } from "@finchat/ui/badge";
import { Button } from "@finchat/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@finchat/ui/card";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth, getSession } from "~/auth/server";

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
						Use sua conta Google autorizada para acessar pedidos, catálogo e operação.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="rounded-2xl border border-primary/10 bg-primary/[0.04] p-4">
						<p className="font-medium text-primary text-sm">Autenticação segura</p>
						<p className="mt-1 text-muted-foreground text-sm">
							O acesso do staff respeita o vínculo da conta com cada hotel.
						</p>
					</div>
					<form>
						<Button
							className="w-full"
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
							Entrar com Google
						</Button>
					</form>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="border-primary/15 bg-card/88 shadow-lg shadow-primary/10 backdrop-blur-sm">
			<CardHeader>
				<CardTitle className="text-2xl">Sessão ativa</CardTitle>
				<CardDescription>Conectado como {session.user.name}</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="rounded-2xl border border-primary/10 bg-primary/[0.04] p-4">
					<p className="font-medium text-primary text-sm">Pronto para operar</p>
					<p className="mt-1 text-muted-foreground text-sm">
						Você já pode acessar os painéis do hotel com o vínculo autorizado da sua
						conta.
					</p>
				</div>

				<form>
					<Button
						className="w-full"
						formAction={async () => {
							"use server";
							await auth.api.signOut({
								headers: await headers(),
							});
							redirect("/");
						}}
						size="lg"
						type="submit"
						variant="outline"
					>
						Sair da conta
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
