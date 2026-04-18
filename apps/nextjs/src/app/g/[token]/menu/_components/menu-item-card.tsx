import type { MenuItemView } from "@finchat/api";
import { Badge } from "@finchat/ui/badge";
import { Card, CardContent } from "@finchat/ui/card";
import Image from "next/image";

function formatPrice(priceInCents: number) {
	return new Intl.NumberFormat("pt-BR", {
		currency: "BRL",
		style: "currency",
	}).format(priceInCents / 100);
}

export function MenuItemCard(props: {
	item: MenuItemView;
	onSelect: (item: MenuItemView) => void;
}) {
	return (
		<Card className="group overflow-hidden rounded-[28px] border-white/60 bg-white/90 shadow-[0_24px_70px_-34px_rgba(15,23,42,0.28)] backdrop-blur transition-transform duration-200 hover:-translate-y-1">
			<button
				className="block w-full text-left"
				onClick={() => props.onSelect(props.item)}
				type="button"
			>
				<div className="relative overflow-hidden">
					{props.item.imageUrl ? (
						<Image
							alt={props.item.name}
							className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
							height={320}
							src={props.item.imageUrl}
							width={320}
						/>
					) : (
						<div className="flex aspect-square w-full items-center justify-center bg-[linear-gradient(135deg,_#fff1ee,_#ffe6dc_55%,_#ffd4c4)]">
							<span className="rounded-full bg-white/85 px-4 py-2 font-medium text-[#b42318] text-sm shadow-sm">
								Room service
							</span>
						</div>
					)}
					<div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/48 via-black/10 to-transparent" />
					<Badge className="absolute top-3 left-3 rounded-full border-0 bg-white/92 px-3 py-1 text-slate-900 shadow-none hover:bg-white/92">
						{formatPrice(props.item.priceInCents)}
					</Badge>
				</div>
				<CardContent className="space-y-2 p-4">
					<p className="font-semibold text-[17px] text-slate-950 leading-tight">
						{props.item.name}
					</p>
					<p className="text-muted-foreground text-sm">
						Toque para escolher quantidade e observacoes.
					</p>
				</CardContent>
			</button>
		</Card>
	);
}
