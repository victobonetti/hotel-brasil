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
		<Card className="group overflow-hidden rounded-[30px] border-[#f0e1db] bg-[#fffdfb] shadow-[0_28px_60px_-42px_rgba(86,59,52,0.34)] transition-transform duration-200 hover:-translate-y-0.5">
			<button
				className="block w-full text-left"
				onClick={() => props.onSelect(props.item)}
				type="button"
			>
				<div className="flex gap-3 p-3 sm:flex-col sm:p-4">
					<div className="relative w-28 shrink-0 overflow-hidden rounded-[24px] bg-[#fff1ea] sm:w-full">
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
					<CardContent className="flex min-w-0 flex-1 flex-col justify-between p-0 sm:pt-1">
						<div className="space-y-2">
							<div className="flex items-start justify-between gap-3">
								<div className="space-y-1">
									<p className="font-semibold text-[17px] text-[#281816] leading-tight">
										{props.item.name}
									</p>
									<p className="line-clamp-2 text-[#7d6660] text-sm leading-5">
										{props.item.description ??
											"Toque para ajustar quantidade e observacoes antes de adicionar."}
									</p>
								</div>
								<span className="shrink-0 rounded-full bg-[#fff1ec] px-2.5 py-1 font-medium text-[#b15a45] text-[11px] uppercase tracking-[0.16em]">
									{props.item.preparationTimeMinutes ?? 15} min
								</span>
							</div>
						</div>
						<div className="mt-4 flex items-center justify-between gap-3 rounded-[22px] bg-[#fff7f3] px-3 py-2.5">
							<p className="text-[#7d6660] text-xs uppercase tracking-[0.2em]">
								Personalizar
							</p>
							<p className="font-medium text-[#c34733] text-sm">Adicionar</p>
						</div>
					</CardContent>
				</div>
			</button>
		</Card>
	);
}
