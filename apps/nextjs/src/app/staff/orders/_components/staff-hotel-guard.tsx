"use client";

import { Button } from "@finchat/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@finchat/ui/card";

type GuardState = "loading" | "needs-auth" | "unauthorized";

export function StaffHotelGuard(props: {
	children: React.ReactNode;
	state?: GuardState;
}) {
	if (props.state === "loading") {
		return (
			<Card className="border-dashed">
				<CardHeader>
					<CardTitle>Carregando painel operacional</CardTitle>
					<CardDescription>
						Estamos validando seu acesso e buscando os pedidos ativos.
					</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	if (props.state === "needs-auth") {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Login necessário</CardTitle>
					<CardDescription>
						Faça login com sua conta Google para acessar o painel do hotel.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button onClick={() => (window.location.href = "/")}>Ir para login</Button>
				</CardContent>
			</Card>
		);
	}

	if (props.state === "unauthorized") {
		return (
			<Card className="border-destructive/20 bg-destructive/5">
				<CardHeader>
					<CardTitle>Acesso negado</CardTitle>
					<CardDescription>
						Sua conta está autenticada, mas ainda não possui vínculo com um hotel.
					</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	return <>{props.children}</>;
}
