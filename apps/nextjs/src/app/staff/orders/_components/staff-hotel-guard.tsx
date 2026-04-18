"use client";

import { Button } from "@nowait24/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@nowait24/ui/card";

type GuardState = "loading" | "needs-auth" | "unauthorized";

export function StaffHotelGuard(props: {
	children: React.ReactNode;
	errorMessage?: string;
	state?: GuardState;
}) {
	if (props.state === "loading") {
		return (
			<Card className="border-primary/20 border-dashed bg-card/85">
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
			<Card className="border-primary/15 bg-card/88">
				<CardHeader>
					<CardTitle>Login necessário</CardTitle>
					<CardDescription>
						Faça login com sua conta Google para acessar o painel do hotel.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button onClick={() => (window.location.href = "/")}>
						Ir para login
					</Button>
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
						{props.errorMessage ??
							"Sua conta está autenticada, mas ainda não possui vínculo com um hotel."}
					</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	return <>{props.children}</>;
}
