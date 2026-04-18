import { Card, CardContent, CardHeader, CardTitle } from "@nowait24/ui/card";

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
		<Card className="overflow-hidden rounded-[28px] border-white/60 bg-white/88 shadow-[0_20px_70px_-30px_rgba(15,23,42,0.28)] backdrop-blur">
			<CardHeader className="border-white/70 border-b bg-white/70">
				<div className="flex items-center gap-2">
					<div className="flex size-9 items-center justify-center rounded-full bg-slate-100 text-slate-700">
						<span className="text-sm">12</span>
					</div>
					<div>
						<CardTitle className="text-lg">Atualizacoes do pedido</CardTitle>
						<p className="text-muted-foreground text-sm">
							Cada movimentacao aparece aqui em ordem cronologica.
						</p>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-4 pt-5">
				{props.history.map((entry, index) => (
					<div className="flex items-start gap-3" key={entry.id}>
						<div className="mt-1.5 flex flex-col items-center">
							<div className="size-3 rounded-full bg-[#ea1d2c] shadow-[0_0_0_6px_rgba(234,29,44,0.12)]" />
							{index < props.history.length - 1 ? (
								<div className="mt-1 h-full min-h-14 w-px bg-[#f0d5d2]" />
							) : null}
						</div>
						<div className="flex-1 space-y-2 rounded-[24px] border border-[#f0d5d2] bg-[#fffaf9] px-4 py-4">
							<div className="flex flex-wrap items-center justify-between gap-2">
								<OrderStatusBadge status={entry.toStatus} />
								<span className="text-muted-foreground text-sm">
									{formatDate(entry.changedAt)}
								</span>
							</div>
							<p className="font-medium text-slate-900 text-sm">
								Etapa {index + 1} concluida
							</p>
							{entry.reason ? (
								<p className="text-muted-foreground text-sm">{entry.reason}</p>
							) : (
								<p className="text-muted-foreground text-sm">
									Status atualizado automaticamente pela operacao do hotel.
								</p>
							)}
						</div>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
