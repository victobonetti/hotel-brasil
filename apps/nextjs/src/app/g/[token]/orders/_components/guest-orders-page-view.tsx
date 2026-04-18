import { buttonVariants } from "@nowait24/ui/button";
import { Card, CardContent } from "@nowait24/ui/card";
import type { PaginationMetadata } from "@nowait24/utils";

import {
	formatOrderReference,
	formatRoomReference,
} from "~/app/_components/order-display";
import { PageShell } from "~/app/_components/page-shell";
import { PaginationControls } from "~/app/_components/pagination-controls";
import { OrderStatusBadge } from "../[orderId]/_components/order-status-badge";
import { getTrackingStatusPresentation } from "../[orderId]/_components/order-tracking-display";

interface GuestOrderListItem {
	id: string;
	placedAt: Date;
	roomId: string;
	roomLabel?: string | null;
	status:
		| "accepted"
		| "cancelled"
		| "delivered"
		| "out_for_delivery"
		| "pending"
		| "preparing";
	totalAmountInCents: number;
}

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

function GuestOrderCard(props: {
	ctaLabel: string;
	guestSessionToken: string;
	order: GuestOrderListItem;
}) {
	const orderReference = formatOrderReference(props.order.id);
	const roomReference = formatRoomReference({
		roomId: props.order.roomId,
		roomLabel: props.order.roomLabel,
	});
	const statusPresentation = getTrackingStatusPresentation(props.order.status);

	return (
		<Card className="rounded-[26px] border-white/70 bg-white/88 shadow-[0_20px_60px_-38px_rgba(15,23,42,0.35)] backdrop-blur">
			<CardContent className="space-y-4 pt-5">
				<div className="flex flex-wrap items-start justify-between gap-3">
					<div className="space-y-2">
						<p className="font-semibold text-lg text-slate-950">
							Pedido {orderReference}
						</p>
						<div className="flex flex-wrap gap-2 text-slate-500 text-sm">
							<span>{roomReference}</span>
							<span aria-hidden="true">|</span>
							<span>{formatDate(props.order.placedAt)}</span>
						</div>
					</div>
					<OrderStatusBadge status={props.order.status} />
				</div>

				<div
					className={`rounded-[22px] bg-gradient-to-r ${statusPresentation.accentClassName} px-4 py-4 text-white`}
				>
					<p className="text-white/74 text-xs uppercase tracking-[0.24em]">
						{statusPresentation.eyebrow}
					</p>
					<p className="mt-2 font-semibold text-base">
						{statusPresentation.title}
					</p>
					<p className="mt-1 text-sm text-white/82">
						{statusPresentation.description}
					</p>
				</div>

				<div className="flex items-center justify-between gap-3 rounded-[22px] bg-slate-950 px-4 py-4 text-white">
					<div>
						<p className="text-white/70 text-xs uppercase tracking-[0.24em]">
							Total
						</p>
						<p className="mt-1 text-sm text-white/82">Resumo do pedido</p>
					</div>
					<p className="font-semibold text-lg">
						{formatPrice(props.order.totalAmountInCents)}
					</p>
				</div>

				<a
					className={buttonVariants({
						className:
							"h-11 w-full rounded-full shadow-[0_16px_32px_-18px_rgba(234,29,44,0.9)]",
					})}
					href={`/g/${props.guestSessionToken}/orders/${props.order.id}`}
				>
					{props.ctaLabel}
				</a>
			</CardContent>
		</Card>
	);
}

function SectionEmptyState(props: { description: string; title: string }) {
	return (
		<Card className="rounded-[26px] border-white/70 border-dashed bg-white/72 shadow-none">
			<CardContent className="space-y-2 py-8 text-center">
				<p className="font-medium text-slate-950">{props.title}</p>
				<p className="text-muted-foreground text-sm">{props.description}</p>
			</CardContent>
		</Card>
	);
}

function SummaryCard(props: { label: string; value: string }) {
	return (
		<div className="rounded-[24px] border border-white/12 bg-white/10 px-3 py-3 backdrop-blur-sm">
			<p className="text-white/70 text-xs uppercase tracking-[0.22em]">
				{props.label}
			</p>
			<p className="mt-2 font-semibold text-sm sm:text-base">{props.value}</p>
		</div>
	);
}

export function GuestOrdersPageView(props: {
	activeOrders: Array<GuestOrderListItem>;
	activePagination: PaginationMetadata;
	activeTotal: number;
	guestSessionToken: string;
	hasActiveOrders: boolean;
	hasHistoryOrders: boolean;
	historyOrders: Array<GuestOrderListItem>;
	historyPagination: PaginationMetadata;
	historyTotal: number;
}) {
	return (
		<PageShell
			className="bg-[radial-gradient(circle_at_top,_rgba(234,29,44,0.16),_transparent_32%),linear-gradient(180deg,_#fff8f6_0%,_#fff_55%,_#fff5f2_100%)]"
			containerClassName="max-w-6xl gap-4 px-4 pb-24 pt-4 md:px-6 md:pb-16"
		>
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<a
					className={buttonVariants({
						className:
							"rounded-full border-white/80 bg-white/85 px-4 text-slate-900 shadow-sm backdrop-blur hover:bg-white",
						variant: "outline",
					})}
					href={`/g/${props.guestSessionToken}/menu`}
				>
					<span aria-hidden="true" className="text-base leading-none">
						{"<"}
					</span>
					Cardapio
				</a>
				<div className="inline-flex items-center gap-2 self-start rounded-full bg-white/80 px-3 py-2 text-[13px] text-slate-600 shadow-sm backdrop-blur">
					<span
						aria-hidden="true"
						className="inline-block size-2 rounded-full bg-[#ea1d2c]"
					/>
					{props.hasActiveOrders
						? "Atualizacao automatica para pedidos ativos"
						: "Historico desta sessao"}
				</div>
			</div>

			<section className="overflow-hidden rounded-[32px] bg-gradient-to-br from-[#ea1d2c] via-[#ff5a36] to-[#ff9f43] p-5 text-white shadow-[0_30px_90px_-36px_rgba(234,29,44,0.75)] md:p-6">
				<div className="space-y-5">
					<div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
						<div className="space-y-3">
							<div className="inline-flex rounded-full bg-white/18 px-3 py-1 font-medium text-sm backdrop-blur">
								Acompanhe seus pedidos
							</div>
							<div className="space-y-2">
								<h1 className="max-w-2xl font-semibold text-3xl leading-tight tracking-tight sm:text-4xl">
									Veja primeiro o que esta em andamento
								</h1>
								<p className="max-w-xl text-sm text-white/82 sm:text-base">
									Os pedidos ativos ficam em destaque para voce acompanhar sem
									procurar. O historico continua logo abaixo, separado e mais
									facil de consultar.
								</p>
							</div>
						</div>
						<div className="rounded-[28px] bg-black/15 p-4 backdrop-blur-sm">
							<p className="text-white/70 text-xs uppercase tracking-[0.24em]">
								Navegacao rapida
							</p>
							<div className="mt-3 space-y-3 text-sm text-white/86">
								<p>1. Acompanhe os pedidos ativos.</p>
								<p>2. Abra um pedido para ver os detalhes.</p>
								<p>3. Use o cardapio para fazer um novo pedido.</p>
							</div>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
						<SummaryCard
							label="Ativos"
							value={`${props.activeTotal} pedido(s)`}
						/>
						<SummaryCard
							label="Historico"
							value={`${props.historyTotal} pedido(s)`}
						/>
						<SummaryCard
							label="Atualizacao"
							value={props.hasActiveOrders ? "Automatica" : "Sob demanda"}
						/>
						<SummaryCard label="Acesso" value="Detalhes em um toque" />
					</div>
				</div>
			</section>

			<div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
				<section className="space-y-4">
					<div className="space-y-1">
						<h2 className="font-semibold text-2xl text-slate-950">
							Em andamento
						</h2>
						<p className="text-muted-foreground text-sm">
							Pedidos que ainda estao sendo preparados, confirmados ou a
							caminho.
						</p>
					</div>
					{props.activeOrders.length > 0 ? (
						<div className="space-y-4">
							{props.activeOrders.map((order) => (
								<GuestOrderCard
									ctaLabel="Acompanhar"
									guestSessionToken={props.guestSessionToken}
									key={order.id}
									order={order}
								/>
							))}
							{props.activePagination.totalPages > 1 ? (
								<PaginationControls
									pageParam="activePage"
									pagination={props.activePagination}
								/>
							) : null}
						</div>
					) : (
						<SectionEmptyState
							description="Assim que um novo pedido for criado, ele aparecera aqui com atualizacoes em tempo real."
							title="Nenhum pedido em andamento."
						/>
					)}
					<a
						className={buttonVariants({
							className: "h-11 rounded-full px-5",
							variant: "outline",
						})}
						href={`/g/${props.guestSessionToken}/menu`}
					>
						Fazer novo pedido
					</a>
				</section>

				<section className="space-y-4">
					<div className="space-y-1">
						<h2 className="font-semibold text-2xl text-slate-950">Historico</h2>
						<p className="text-muted-foreground text-sm">
							Pedidos entregues ou cancelados durante esta sessao do hospede.
						</p>
					</div>
					{props.historyOrders.length > 0 ? (
						<div className="space-y-4">
							{props.historyOrders.map((order) => (
								<GuestOrderCard
									ctaLabel="Ver detalhes"
									guestSessionToken={props.guestSessionToken}
									key={order.id}
									order={order}
								/>
							))}
							{props.historyPagination.totalPages > 1 ? (
								<PaginationControls
									pageParam="historyPage"
									pagination={props.historyPagination}
								/>
							) : null}
						</div>
					) : (
						<SectionEmptyState
							description="Pedidos entregues ou cancelados vao aparecer aqui quando a sessao acumular historico."
							title="Nenhum pedido no historico desta sessao."
						/>
					)}
				</section>
			</div>
		</PageShell>
	);
}
