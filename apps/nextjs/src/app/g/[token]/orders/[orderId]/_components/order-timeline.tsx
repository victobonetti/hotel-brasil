import { Card, CardContent, CardHeader, CardTitle } from "@finchat/ui/card";

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
		<Card className="border-primary/15 bg-card/88 shadow-primary/10 shadow-sm">
			<CardHeader className="border-border/60 border-b">
				<CardTitle>Linha do tempo</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4 pt-6">
				{props.history.map((entry, index) => (
					<div className="flex items-start gap-3" key={entry.id}>
						<div className="mt-1.5 flex flex-col items-center">
							<div className="size-3 rounded-full bg-primary shadow-primary/40 shadow-sm" />
							{index < props.history.length - 1 ? (
								<div className="mt-1 h-12 w-px bg-border" />
							) : null}
						</div>
						<div className="space-y-1 rounded-2xl border border-primary/10 bg-primary/[0.03] px-4 py-3">
							<div className="flex flex-wrap items-center gap-2">
								<OrderStatusBadge status={entry.toStatus} />
								<span className="text-muted-foreground text-sm">
									{formatDate(entry.changedAt)}
								</span>
							</div>
							{entry.reason ? (
								<p className="text-muted-foreground text-sm">{entry.reason}</p>
							) : null}
						</div>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
