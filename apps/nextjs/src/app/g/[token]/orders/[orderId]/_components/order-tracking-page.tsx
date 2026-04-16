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

import { PageShell, SectionHeader } from "~/app/_components/page-shell";
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
				<Card className="w-full border-dashed border-primary/20 bg-card/88">
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
		<PageShell containerClassName="max-w-5xl gap-8">
			<SectionHeader
				badge="Pedido confirmado"
				description="O status desta página é atualizado automaticamente para que você acompanhe o room service com mais clareza e confiança."
				title="Acompanhe seu room service em tempo real"
			/>

			<div className="grid gap-3 md:grid-cols-3">
				<Card className="border-primary/15 bg-card/88" size="sm">
					<CardContent className="space-y-1 pt-4">
						<p className="font-medium text-primary text-sm">Status atual</p>
						<p className="font-semibold text-lg">
							{trackingQuery.data.order.status.replaceAll("_", " ")}
						</p>
					</CardContent>
				</Card>
				<Card className="border-primary/15 bg-card/88" size="sm">
					<CardContent className="space-y-1 pt-4">
						<p className="font-medium text-primary text-sm">Quarto</p>
						<p className="font-semibold text-lg">{trackingQuery.data.order.roomId}</p>
					</CardContent>
				</Card>
				<Card className="border-primary/15 bg-card/88" size="sm">
					<CardContent className="space-y-1 pt-4">
						<p className="font-medium text-primary text-sm">Itens</p>
						<p className="font-semibold text-lg">{trackingQuery.data.order.items.length}</p>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
				<OrderSummaryCard order={trackingQuery.data.order} />
				<OrderTimeline history={trackingQuery.data.history} />
			</div>
		</PageShell>
	);
}
