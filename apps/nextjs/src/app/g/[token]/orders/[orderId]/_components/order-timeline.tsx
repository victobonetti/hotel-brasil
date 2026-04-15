import { Card, CardContent, CardHeader, CardTitle } from "@finchat/ui/card";

import { OrderStatusBadge } from "./order-status-badge";

type HistoryItem = {
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
};

function formatDate(date: Date) {
	return new Intl.DateTimeFormat("pt-BR", {
		dateStyle: "short",
		timeStyle: "short",
	}).format(date);
}

export function OrderTimeline(props: { history: HistoryItem[] }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Linha do tempo</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{props.history.map((entry) => (
					<div className="flex items-start gap-3" key={entry.id}>
						<div className="mt-2 size-2 rounded-full bg-primary" />
						<div className="space-y-1">
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
