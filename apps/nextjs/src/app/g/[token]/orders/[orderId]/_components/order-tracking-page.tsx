"use client";

import { Button } from "@nowait24/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@nowait24/ui/card";
import { PAGE_SIZES, paginateItems } from "@nowait24/utils";
import { useQuery } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import {
	formatRoomReference,
	getOrderDisplayMeta,
} from "~/app/_components/order-display";
import { PageShell } from "~/app/_components/page-shell";
import { PaginationControls } from "~/app/_components/pagination-controls";
import {
	buildPageSearch,
	parsePageParam,
	shouldSyncPageParam,
} from "~/app/_components/pagination-state";
import { useTRPC } from "~/trpc/react";
import { OrderSummaryCard } from "./order-summary-card";
import { OrderTimeline } from "./order-timeline";
import {
	buildTrackingSteps,
	getTrackingStatusPresentation,
} from "./order-tracking-display";

function formatPrice(priceInCents: number) {
	return new Intl.NumberFormat("pt-BR", {
		currency: "BRL",
		style: "currency",
	}).format(priceInCents / 100);
}

function formatDate(date: Date) {
	return new Intl.DateTimeFormat("pt-BR", {
		dateStyle: "short",
		timeStyle: "short",
	}).format(date);
}

export function OrderTrackingPage(props: {
	guestSessionToken: string;
	orderId: string;
}) {
	const trpc = useTRPC();
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();
	const detailsItemsPage = parsePageParam(
		searchParams.get("detailsItemsPage") ?? undefined,
	);
	const detailsHistoryPage = parsePageParam(
		searchParams.get("detailsHistoryPage") ?? undefined,
	);
	const trackingQuery = useQuery({
		...trpc.order.getOrderTracking.queryOptions({
			guestSessionToken: props.guestSessionToken,
			orderId: props.orderId,
		}),
		refetchInterval: 5000,
	});

	const paginatedItems = paginateItems(trackingQuery.data?.order.items ?? [], {
		page: detailsItemsPage,
		pageSize: PAGE_SIZES.categoryDetailsItems,
	});
	const paginatedHistory = paginateItems(trackingQuery.data?.history ?? [], {
		page: detailsHistoryPage,
		pageSize: PAGE_SIZES.categoryDetailsHistory,
	});

	useEffect(() => {
		if (!shouldSyncPageParam(detailsItemsPage, paginatedItems.pagination)) {
			return;
		}

		const nextSearch = buildPageSearch(
			new URLSearchParams(searchParams.toString()),
			"detailsItemsPage",
			paginatedItems.pagination.page,
		);
		router.replace(
			(nextSearch.length > 0 ? `${pathname}?${nextSearch}` : pathname) as Route,
			{
				scroll: false,
			},
		);
	}, [
		detailsItemsPage,
		paginatedItems.pagination,
		pathname,
		router,
		searchParams,
	]);

	useEffect(() => {
		if (!shouldSyncPageParam(detailsHistoryPage, paginatedHistory.pagination)) {
			return;
		}

		const nextSearch = buildPageSearch(
			new URLSearchParams(searchParams.toString()),
			"detailsHistoryPage",
			paginatedHistory.pagination.page,
		);
		router.replace(
			(nextSearch.length > 0 ? `${pathname}?${nextSearch}` : pathname) as Route,
			{
				scroll: false,
			},
		);
	}, [
		detailsHistoryPage,
		paginatedHistory.pagination,
		pathname,
		router,
		searchParams,
	]);

	if (trackingQuery.isLoading) {
		return (
			<main className="mx-auto flex min-h-screen max-w-5xl items-center px-4 py-10">
				<Card className="w-full rounded-[28px] border-primary/20 border-dashed bg-card/88">
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
				<Card className="w-full rounded-[28px] border-destructive/20 bg-destructive/5">
					<CardHeader>
						<CardTitle>Pedido indisponivel</CardTitle>
						<CardDescription>
							{trackingQuery.error?.message ??
								"Nao foi possivel carregar o rastreamento agora."}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button
							render={<Link href={`/g/${props.guestSessionToken}/menu`} />}
							variant="outline"
						>
							Voltar ao cardapio
						</Button>
					</CardContent>
				</Card>
			</main>
		);
	}

	const orderDisplay = getOrderDisplayMeta({
		orderId: trackingQuery.data.order.id,
		roomId: trackingQuery.data.order.roomId,
		roomLabel: trackingQuery.data.order.roomLabel,
	});
	const statusPresentation = getTrackingStatusPresentation(
		trackingQuery.data.order.status,
	);
	const trackingSteps = buildTrackingSteps(trackingQuery.data.order.status);
	const statusCards = [
		{
			iconLabel: "#",
			label: "Pedido",
			value: orderDisplay.orderReference,
		},
		{
			iconLabel: "Q",
			label: "Entrega",
			value: formatRoomReference({
				roomId: trackingQuery.data.order.roomId,
				roomLabel: trackingQuery.data.order.roomLabel,
			}),
		},
		{
			iconLabel: "It",
			label: "Itens",
			value: `${trackingQuery.data.order.items.length} selecionado(s)`,
		},
		{
			iconLabel: "Hr",
			label: "Criado em",
			value: formatDate(trackingQuery.data.order.placedAt),
		},
	] as const;

	return (
		<PageShell
			className="bg-[radial-gradient(circle_at_top,_rgba(234,29,44,0.18),_transparent_30%),linear-gradient(180deg,_#fff8f6_0%,_#fff_55%,_#fff5f2_100%)]"
			containerClassName="max-w-5xl gap-5 px-4 pb-32 pt-5 md:px-6 md:pb-16"
		>
			<div className="flex items-center justify-between gap-3">
				<Button
					className="rounded-full border-white/80 bg-white/85 px-4 text-slate-900 shadow-sm backdrop-blur hover:bg-white"
					render={<Link href={`/g/${props.guestSessionToken}/menu`} />}
					variant="outline"
				>
					<span aria-hidden="true" className="text-base leading-none">
						{"<"}
					</span>
					Cardapio
				</Button>
				<div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 text-[13px] text-slate-600 shadow-sm backdrop-blur">
					<span
						aria-hidden="true"
						className="inline-block size-2 rounded-full bg-[#ea1d2c]"
					/>
					Atualizacao automatica
				</div>
			</div>

			<section
				className={`overflow-hidden rounded-[32px] bg-gradient-to-br ${statusPresentation.accentClassName} p-5 text-white shadow-[0_30px_90px_-36px_rgba(234,29,44,0.75)] md:p-7`}
			>
				<div className="space-y-5">
					<div className="flex flex-wrap items-start justify-between gap-4">
						<div className="space-y-3">
							<div className="inline-flex rounded-full bg-white/18 px-3 py-1 font-medium text-sm backdrop-blur">
								{statusPresentation.eyebrow}
							</div>
							<div className="space-y-2">
								<p className="text-sm text-white/80">
									{orderDisplay.orderTitle}
								</p>
								<h1 className="max-w-xl font-semibold text-3xl leading-tight tracking-tight sm:text-4xl">
									{statusPresentation.title}
								</h1>
								<p className="max-w-lg text-sm text-white/82 sm:text-base">
									{statusPresentation.description}
								</p>
							</div>
						</div>
						<div className="rounded-[28px] bg-black/15 px-4 py-3 backdrop-blur-sm">
							<p className="text-white/70 text-xs uppercase tracking-[0.24em]">
								Quarto
							</p>
							<p className="mt-1 font-semibold text-lg">
								{trackingQuery.data.order.roomLabel ??
									trackingQuery.data.order.roomId}
							</p>
						</div>
					</div>

					<div className="space-y-2">
						<div className="flex items-center justify-between text-sm text-white/80">
							<span>Progresso do pedido</span>
							<span>{statusPresentation.progressValue}%</span>
						</div>
						<div className="h-2 rounded-full bg-white/18">
							<div
								aria-hidden="true"
								className="h-2 rounded-full bg-white transition-[width]"
								style={{ width: `${statusPresentation.progressValue}%` }}
							/>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
						{trackingSteps.map((step) => (
							<div
								className="rounded-[24px] border border-white/12 bg-white/10 px-3 py-3 backdrop-blur-sm"
								key={step.label}
							>
								<div className="flex items-center gap-2">
									<div
										className={`flex size-7 items-center justify-center rounded-full ${
											step.state === "active"
												? "bg-white text-[#ea1d2c]"
												: "bg-white/18 text-white"
										}`}
									>
										<span className="text-sm">OK</span>
									</div>
									<span className="font-medium text-sm">{step.label}</span>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			<div className="grid grid-cols-2 gap-3">
				{statusCards.map((card) => (
					<Card
						className="rounded-[26px] border-white/70 bg-white/84 shadow-[0_20px_60px_-38px_rgba(15,23,42,0.35)] backdrop-blur"
						key={card.label}
						size="sm"
					>
						<CardContent className="space-y-3 pt-4">
							<div className="flex size-10 items-center justify-center rounded-full bg-[#fff1ee] text-[#ea1d2c]">
								<span className="font-semibold text-sm">{card.iconLabel}</span>
							</div>
							<div className="space-y-1">
								<p className="text-muted-foreground text-xs uppercase tracking-[0.22em]">
									{card.label}
								</p>
								<p className="font-semibold text-sm leading-snug sm:text-base">
									{card.value}
								</p>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			<div className="grid gap-4 lg:grid-cols-[1.12fr_0.88fr]">
				<div className="space-y-3">
					<OrderSummaryCard
						order={{
							...trackingQuery.data.order,
							items: paginatedItems.items,
						}}
					/>
					<PaginationControls
						pageParam="detailsItemsPage"
						pagination={paginatedItems.pagination}
					/>
				</div>
				<div className="space-y-3">
					<OrderTimeline history={paginatedHistory.items} />
					<PaginationControls
						pageParam="detailsHistoryPage"
						pagination={paginatedHistory.pagination}
					/>
				</div>
			</div>

			<div className="fixed inset-x-0 bottom-0 z-20 border-[#f0d7d3] border-t bg-white/92 px-4 py-4 shadow-[0_-18px_48px_-32px_rgba(15,23,42,0.3)] backdrop-blur md:hidden">
				<div className="mx-auto flex max-w-5xl items-center gap-3">
					<div className="min-w-0 flex-1">
						<p className="text-muted-foreground text-xs uppercase tracking-[0.24em]">
							Total do pedido
						</p>
						<p className="truncate font-semibold text-lg text-slate-950">
							{formatPrice(trackingQuery.data.order.totalAmountInCents)}
						</p>
					</div>
					<Button
						className="h-11 rounded-full px-5 shadow-[0_16px_32px_-18px_rgba(234,29,44,0.9)]"
						render={<Link href={`/g/${props.guestSessionToken}/menu`} />}
					>
						Ver cardapio
					</Button>
				</div>
			</div>
		</PageShell>
	);
}
