"use client";

import { Button } from "@nowait24/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@nowait24/ui/card";
import Link from "next/link";

export function GuestSessionGuard(props: {
	children: React.ReactNode;
	errorMessage?: string;
	isLoading?: boolean;
}) {
	if (props.isLoading) {
		return (
			<Card className="border-dashed">
				<CardHeader>
					<CardTitle>Carregando cardápio</CardTitle>
					<CardDescription>
						Estamos validando sua sessão e buscando os itens disponíveis.
					</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	if (props.errorMessage) {
		return (
			<Card className="border-destructive/20 bg-destructive/5">
				<CardHeader>
					<CardTitle>Sessão indisponível</CardTitle>
					<CardDescription>{props.errorMessage}</CardDescription>
				</CardHeader>
				<CardContent>
					<Button render={<Link href="/" />} variant="outline">
						Voltar para o início
					</Button>
				</CardContent>
			</Card>
		);
	}

	return <>{props.children}</>;
}
