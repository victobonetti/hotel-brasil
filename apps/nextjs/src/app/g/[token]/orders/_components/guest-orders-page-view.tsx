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
		<Card className="overflow-hidden rounded-[32px] border-[#efe0da] bg-[#fffdfb] shadow-[0_28px_60px_-44px_rgba(86,59,52,0.34)]">
			<CardContent className="space-y-4 p-4">
				<div className="flex items-start justify-between gap-3">
					<div className="space-y-1">
						<p className="font-semibold text-[18px] text-[#2c1b19]">
							Pedido {orderReference}
						</p>
						<div className="flex flex-wrap gap-2 text-[#7d6660] text-sm">
							<span>{roomReference}</span>
							<span aria-hidden="true">|</span>
							<span>{formatDate(props.order.placedAt)}</span>
						</div>
					</div>
					<OrderStatusBadge status={props.order.status} />
				</div>

				<div className="rounded-[26px] bg-[#fff6f2] p-4">
					<div className="flex items-center justify-between gap-3">
						<div className="space-y-1">
							<p className="text-[#b15a45] text-[11px] uppercase tracking-[0.22em]">
								Status
							</p>
							<p className="font-semibold text-[#2c1b19] text-base">
								{statusPresentation.title}
							</p>
						</div>
						<div className="rounded-full bg-white px-3 py-1 font-medium text-[#7d6660] text-xs">
							{statusPresentation.progressValue}%
						</div>
					</div>
					<p className="mt-2 text-[#7d6660] text-sm leading-6">
						{statusPresentation.description}
					</p>
				</div>

				<div className="flex items-center justify-between gap-3 rounded-[24px] bg-[#241816] px-4 py-4 text-white">
					<div>
						<p className="text-[11px] uppercase tracking-[0.22em] text-white/58">
							Total
						</p>
						<p className="mt-1 text-sm text-white/78">Resumo do pedido</p>
					</div>
					<p className="font-semibold text-lg">
						{formatPrice(props.order.totalAmountInCents)}
					</p>
				</div>

				<a
					className={buttonVariants({
						className:
							"h-11 w-full rounded-full bg-[#d94d38] text-white shadow-[0_20px_36px_-22px_rgba(217,77,56,0.9)] hover:bg-[#c94330]",
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
		<Card className="rounded-[28px] border border-[#eadad4] border-dashed bg-[#fffaf7] shadow-none">
			<CardContent className="space-y-2 px-5 py-8">
				<p className="font-medium text-[#2c1b19]">{props.title}</p>
				<p className="text-[#7d6660] text-sm leading-6">{props.description}</p>
			</CardContent>
		</Card>
	);
}

function SummaryCard(props: { label: string; value: string }) {
	return (
		<div className="rounded-[24px] border border-[#f0ddd7] bg-white px-3 py-3 shadow-[0_20px_32px_-30px_rgba(86,59,52,0.28)]">
			<p className="text-[#b15a45] text-[11px] uppercase tracking-[0.22em]">
				{props.label}
			</p>
			<p className="mt-2 font-semibold text-[#2c1b19] text-sm">{props.value}</p>
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
			className="bg-[radial-gradient(circle_at_top,_rgba(217,77,56,0.14),_transparent_28%),linear-gradient(180deg,_#fff8f5_0%,_#fffdfb_54%,_#fff4ed_100%)]"
			containerClassName="max-w-5xl gap-4 px-4 pb-24 pt-4 md:px-6 md:pb-14"
		>
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<a
					className={buttonVariants({
						className:
							"rounded-full border-[#ead8d2] bg-[#fffaf7] px-4 text-[#3d2926] shadow-[0_18px_40px_-30px_rgba(92,58,50,0.35)] hover:bg-white",
						variant: "outline",
					})}
					href={`/g/${props.guestSessionToken}/menu`}
				>
					<span aria-hidden="true" className="text-base leading-none">
						{"<"}
					</span>
					Voltar ao menu
				</a>
				<div className="inline-flex items-center gap-2 self-start rounded-full border border-[#ebddd9] bg-white/92 px-3 py-2 text-[13px] text-[#7d6660] shadow-[0_18px_32px_-28px_rgba(92,58,50,0.28)]">
					<span
						aria-hidden="true"
						className="inline-block size-2 rounded-full bg-[#de5a43]"
					/>
					{props.hasActiveOrders
						? "Atualizando pedidos ativos"
						: "Historico desta sessao"}
				</div>
			</div>

			<section className="overflow-hidden rounded-[36px] border border-[#f1ddd6] bg-[linear-gradient(180deg,#fff9f5_0%,#fff3ee_100%)] p-5 shadow-[0_30px_70px_-46px_rgba(86,59,52,0.38)]">
				<div className="space-y-5">
					<div className="space-y-3">
						<div className="inline-flex rounded-full bg-white px-3 py-1 font-medium text-[#b15a45] text-sm shadow-[0_18px_32px_-28px_rgba(86,59,52,0.28)]">
							Pedidos da sua estadia
						</div>
						<div className="space-y-2">
							<h1 className="max-w-xl font-semibold text-3xl text-[#2c1b19] leading-tight tracking-tight">
								Veja o que esta em andamento e o que ja chegou
							</h1>
							<p className="max-w-xl text-[#7d6660] text-sm leading-6">
								Os pedidos ativos aparecem primeiro para voce acompanhar sem
								procurar. O restante fica salvo logo abaixo para consulta
								rapida.
							</p>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<SummaryCard
							label="Agora"
							value={`${props.activeTotal} pedido(s)`}
						/>
						<SummaryCard
							label="Antes"
							value={`${props.historyTotal} pedido(s)`}
						/>
						<SummaryCard
							label="Atualizacao"
							value={props.hasActiveOrders ? "Automatica" : "Sob demanda"}
						/>
						<SummaryCard label="Atalho" value="Menu e detalhes em um toque" />
					</div>
				</div>
			</section>

			<div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
				<section className="space-y-4">
					<div className="space-y-1">
						<h2 className="font-semibold text-2xl text-[#2c1b19]">Agora</h2>
						<p className="max-w-md text-muted-foreground text-sm">
							Pedidos que ainda estao sendo preparados, confirmados ou a caminho
							do quarto.
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
							className:
								"h-11 rounded-full border-[#ead8d2] bg-[#fffaf7] px-5 text-[#3d2926] hover:bg-white",
							variant: "outline",
						})}
						href={`/g/${props.guestSessionToken}/menu`}
					>
						Fazer novo pedido
					</a>
				</section>

				<section className="space-y-4">
					<div className="space-y-1">
						<h2 className="font-semibold text-2xl text-[#2c1b19]">Antes</h2>
						<p className="max-w-md text-muted-foreground text-sm">
							Pedidos finalizados nesta sessao para voce consultar novamente
							quando precisar.
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
