import { Card, CardContent } from "@nowait24/ui/card";

import { OrderStatusBadge } from "./order-status-badge";

interface HistoryItem {
	changedAt: Date;
	id: string;
	reason: string | null;
	toStatus:
		| "accepted"
		| "cancelled"
		| "delivered"
		| "out_for_delivery"
		| "pending"
		| "preparing";
}

function formatDate(date: Date) {
	return new Intl.DateTimeFormat("pt-BR", {
		dateStyle: "short",
		timeStyle: "short",
	}).format(date);
}

export function OrderTimeline(props: { history: Array<HistoryItem> }) {
	return (
		<Card className="overflow-hidden rounded-[32px] border-[#efe0da] bg-[#fffdfb] shadow-[0_28px_60px_-44px_rgba(86,59,52,0.3)]">
			<CardContent className="space-y-5 p-4">
				<div className="space-y-2 rounded-[28px] bg-[#fff7f3] p-4">
					<div className="inline-flex rounded-full bg-white px-3 py-1 font-medium text-[#b15a45] text-[11px] uppercase tracking-[0.2em]">
						Atualizacoes
					</div>
					<div className="space-y-1">
						<p className="font-semibold text-[#2c1b19] text-xl">
							Cada etapa aparece aqui
						</p>
						<p className="text-[#7d6660] text-sm leading-6">
							Voce acompanha a evolucao do pedido em ordem cronologica, sem
							precisar atualizar manualmente.
						</p>
					</div>
				</div>

				<div className="space-y-4">
					{props.history.map((entry, index) => (
						<div className="flex items-start gap-3" key={entry.id}>
							<div className="mt-1 flex flex-col items-center">
								<div className="size-3 rounded-full bg-[#de5a43] shadow-[0_0_0_6px_rgba(222,90,67,0.12)]" />
								{index < props.history.length - 1 ? (
									<div className="mt-1 h-full min-h-14 w-px bg-[#eed9d3]" />
								) : null}
							</div>
							<div className="flex-1 space-y-3 rounded-[26px] border border-[#efe0da] bg-white p-4">
								<div className="flex flex-wrap items-center justify-between gap-2">
									<OrderStatusBadge status={entry.toStatus} />
									<span className="text-[#8b7069] text-sm">
										{formatDate(entry.changedAt)}
									</span>
								</div>
								<p className="font-medium text-[#2c1b19] text-sm">
									Etapa {index + 1} concluida
								</p>
								<p className="text-[#7d6660] text-sm leading-6">
									{entry.reason ||
										"Status atualizado automaticamente pela operacao do hotel."}
								</p>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
