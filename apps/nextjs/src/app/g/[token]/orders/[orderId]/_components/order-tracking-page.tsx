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
				<Card className="w-full rounded-[28px] border-[#eadad4] border-dashed bg-[#fffaf7]">
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
				<Card className="w-full rounded-[28px] border-[#ebd6d2] bg-[#fff5f2]">
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
			label: "Pedido",
			value: orderDisplay.orderReference,
		},
		{
			label: "Entrega",
			value: formatRoomReference({
				roomId: trackingQuery.data.order.roomId,
				roomLabel: trackingQuery.data.order.roomLabel,
			}),
		},
		{
			label: "Itens",
			value: `${trackingQuery.data.order.items.length} selecionado(s)`,
		},
		{
			label: "Criado em",
			value: formatDate(trackingQuery.data.order.placedAt),
		},
	] as const;

	return (
		<PageShell
			className="bg-[radial-gradient(circle_at_top,_rgba(217,77,56,0.14),_transparent_28%),linear-gradient(180deg,_#fff8f5_0%,_#fffdfb_54%,_#fff4ed_100%)]"
			containerClassName="max-w-5xl gap-5 px-4 pb-32 pt-4 md:px-6 md:pb-16"
		>
			<div className="flex items-center justify-between gap-3">
				<Button
					className="rounded-full border-[#ead8d2] bg-[#fffaf7] px-4 text-[#3d2926] shadow-[0_18px_40px_-30px_rgba(92,58,50,0.35)] hover:bg-white"
					render={<Link href={`/g/${props.guestSessionToken}/menu`} />}
					variant="outline"
				>
					<span aria-hidden="true" className="text-base leading-none">
						{"<"}
					</span>
					Cardapio
				</Button>
				<div className="inline-flex items-center gap-2 rounded-full border border-[#ebddd9] bg-white/92 px-3 py-2 text-[#7d6660] text-[13px] shadow-[0_18px_32px_-28px_rgba(92,58,50,0.28)]">
					<span
						aria-hidden="true"
						className="inline-block size-2 rounded-full bg-[#de5a43]"
					/>
					Atualizacao automatica
				</div>
			</div>

			<section className="overflow-hidden rounded-[36px] border border-[#f1ddd6] bg-[linear-gradient(180deg,#fff9f5_0%,#fff3ee_100%)] p-5 shadow-[0_30px_70px_-46px_rgba(86,59,52,0.3)]">
				<div className="space-y-5">
					<div className="space-y-3">
						<div className="inline-flex rounded-full bg-white px-3 py-1 font-medium text-[#b15a45] text-sm shadow-[0_18px_32px_-28px_rgba(86,59,52,0.28)]">
							{statusPresentation.eyebrow}
						</div>
						<div className="space-y-2">
							<p className="text-[#8b7069] text-sm">
								{orderDisplay.orderTitle}
							</p>
							<h1 className="max-w-xl font-semibold text-3xl text-[#2c1b19] leading-tight tracking-tight">
								{statusPresentation.title}
							</h1>
							<p className="max-w-xl text-[#7d6660] text-sm leading-6">
								{statusPresentation.description}
							</p>
						</div>
					</div>

					<div className="space-y-2 rounded-[26px] bg-white px-4 py-4 shadow-[0_20px_32px_-28px_rgba(86,59,52,0.22)]">
						<div className="flex items-center justify-between text-[#7d6660] text-sm">
							<span>Progresso do pedido</span>
							<span>{statusPresentation.progressValue}%</span>
						</div>
						<div className="h-2 rounded-full bg-[#f2dfd9]">
							<div
								aria-hidden="true"
								className="h-2 rounded-full bg-[#d94d38] transition-[width]"
								style={{ width: `${statusPresentation.progressValue}%` }}
							/>
						</div>
					</div>

					<div className="grid gap-3 sm:grid-cols-2">
						{trackingSteps.map((step, index) => (
							<div
								className="flex items-center gap-3 rounded-[24px] bg-white px-4 py-3 shadow-[0_20px_32px_-28px_rgba(86,59,52,0.22)]"
								key={step.label}
							>
								<div
									className={`flex size-9 items-center justify-center rounded-full font-semibold text-sm ${
										step.state === "active"
											? "bg-[#d94d38] text-white"
											: "bg-[#fff1ec] text-[#b15a45]"
									}`}
								>
									{index + 1}
								</div>
								<div className="space-y-0.5">
									<p className="font-medium text-[#2c1b19] text-sm">
										{step.label}
									</p>
									<p className="text-[#8b7069] text-xs">
										{step.state === "active" ? "Etapa atual" : "Concluida"}
									</p>
								</div>
							</div>
						))}
					</div>

					<div className="grid grid-cols-2 gap-3">
						{statusCards.map((card) => (
							<div
								className="rounded-[24px] border border-[#f0ddd7] bg-white px-4 py-3 shadow-[0_20px_32px_-28px_rgba(86,59,52,0.22)]"
								key={card.label}
							>
								<p className="text-[#b15a45] text-[11px] uppercase tracking-[0.22em]">
									{card.label}
								</p>
								<p className="mt-2 font-semibold text-[#2c1b19] text-sm leading-6">
									{card.value}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			<div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
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

			<div className="fixed inset-x-0 bottom-0 z-20 border-[#ebddd9] border-t bg-white/96 px-4 py-4 shadow-[0_-18px_48px_-32px_rgba(86,59,52,0.28)] md:hidden">
				<div className="mx-auto flex max-w-5xl items-center gap-3">
					<div className="min-w-0 flex-1">
						<p className="text-[#8b7069] text-[11px] uppercase tracking-[0.22em]">
							Total do pedido
						</p>
						<p className="truncate font-semibold text-[#2c1b19] text-lg">
							{formatPrice(trackingQuery.data.order.totalAmountInCents)}
						</p>
					</div>
					<Button
						className="h-11 rounded-full bg-[#d94d38] px-5 text-white shadow-[0_20px_36px_-22px_rgba(217,77,56,0.9)] hover:bg-[#c94330]"
						render={<Link href={`/g/${props.guestSessionToken}/menu`} />}
					>
						Ver menu
					</Button>
				</div>
			</div>
		</PageShell>
	);
}
