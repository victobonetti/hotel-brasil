"use client";

import { Button } from "@finchat/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@finchat/ui/card";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { useTRPC } from "~/trpc/react";
import { OrderSummaryCard } from "./order-summary-card";
import { OrderTimeline } from "./order-timeline";

export function OrderTrackingPage(props: {
	guestSessionToken: string;
	orderId: string;
}) {
	const trpc = useTRPC();
	const trackingQuery = useQuery({
		...trpc.order.getOrderTracking.queryOptions({
			guestSessionToken: props.guestSessionToken,
			orderId: props.orderId,
		}),
		refetchInterval: 5000,
	});

	if (trackingQuery.isLoading) {
		return (
			<main className="mx-auto flex min-h-screen max-w-5xl items-center px-4 py-10">
				<Card className="w-full border-dashed">
					<CardHeader>
						<CardTitle>Carregando pedido</CardTitle>
						<CardDescription>
							Estamos buscando o status mais recente do seu pedido.
						</CardDescription>
					</CardHeader>
				</Card>
			</main>
		);
	}

	if (trackingQuery.error || !trackingQuery.data) {
		return (
			<main className="mx-auto flex min-h-screen max-w-5xl items-center px-4 py-10">
				<Card className="w-full border-destructive/20 bg-destructive/5">
					<CardHeader>
						<CardTitle>Pedido indisponível</CardTitle>
						<CardDescription>
							{trackingQuery.error?.message ??
								"Não foi possível carregar o rastreamento agora."}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button render={<Link href={`/g/${props.guestSessionToken}/menu`} />} variant="outline">
							Voltar ao cardápio
						</Button>
					</CardContent>
				</Card>
			</main>
		);
	}

	return (
		<main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.14),_transparent_38%),linear-gradient(180deg,_rgba(255,255,255,1),_rgba(248,250,252,1))]">
			<div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 md:px-8 md:py-14">
				<header className="space-y-2">
					<p className="font-medium text-primary text-sm">Pedido confirmado</p>
					<h1 className="font-semibold text-4xl tracking-tight">
						Acompanhe seu room service em tempo real
					</h1>
					<p className="max-w-2xl text-muted-foreground">
						O status desta página é atualizado automaticamente a cada poucos
						segundos.
					</p>
				</header>

				<div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
					<OrderSummaryCard order={trackingQuery.data.order} />
					<OrderTimeline history={trackingQuery.data.history} />
				</div>
			</div>
		</main>
	);
}
