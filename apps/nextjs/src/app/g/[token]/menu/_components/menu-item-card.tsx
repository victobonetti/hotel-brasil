import type { MenuItemView } from "@nowait24/api";
import { Badge } from "@nowait24/ui/badge";
import { Card, CardContent } from "@nowait24/ui/card";
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
		<Card className="group overflow-hidden rounded-[28px] border-[#ecdcd6] bg-[#fffdfb] shadow-[0_24px_56px_-46px_rgba(86,59,52,0.24)] transition-transform duration-200 hover:-translate-y-0.5">
			<button
				className="block w-full text-left"
				onClick={() => props.onSelect(props.item)}
				type="button"
			>
				<div className="flex gap-3 p-3">
					<div className="relative w-24 shrink-0 overflow-hidden rounded-[22px] bg-[#fff1ea] sm:w-28">
						{props.item.imageUrl ? (
							<Image
								alt={props.item.name}
								className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
								height={320}
								src={props.item.imageUrl}
								width={320}
							/>
						) : (
							<div className="flex aspect-square w-full items-center justify-center bg-[linear-gradient(135deg,_#fff5ef,_#fee8de_55%,_#f8d4c0)]">
								<span className="rounded-full bg-white/88 px-3 py-1.5 font-medium text-[#b15a45] text-xs shadow-sm">
									Room service
								</span>
							</div>
						)}
						<Badge className="absolute top-2 left-2 rounded-full border-0 bg-white/94 px-2.5 py-1 text-[#402a25] shadow-none hover:bg-white/94">
							{formatPrice(props.item.priceInCents)}
						</Badge>
					</div>
					<CardContent className="flex min-w-0 flex-1 flex-col justify-between p-0">
						<div className="space-y-3">
							<div className="space-y-1">
								<p className="font-semibold text-[#281816] text-[17px] leading-tight">
									{props.item.name}
								</p>
								{props.item.description ? (
									<p className="line-clamp-2 text-[#7d6660] text-sm leading-5">
										{props.item.description}
									</p>
								) : null}
							</div>
							<div className="flex items-center justify-between gap-3">
								<span className="rounded-full bg-[#fff1ec] px-2.5 py-1 font-medium text-[#b15a45] text-[11px] uppercase tracking-[0.16em]">
									{props.item.preparationTimeMinutes ?? 15} min
								</span>
								<p className="font-medium text-[#c34733] text-sm">Ver item</p>
							</div>
						</div>
					</CardContent>
				</div>
			</button>
		</Card>
	);
}
