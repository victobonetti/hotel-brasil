import { buttonVariants } from "@nowait24/ui/button";

export function GuestMenuActions(props: { guestSessionToken: string }) {
	return (
		<div className="flex items-center gap-2 overflow-x-auto pb-1">
			<a
				className={buttonVariants({
					className:
						"justify-center rounded-full border-[#e7ddd8] bg-white px-4 text-[#3d2926] shadow-none hover:bg-[#faf7f5]",
					variant: "outline",
				})}
				href={`/g/${props.guestSessionToken}`}
			>
				<span aria-hidden="true" className="text-base leading-none">
					{"<"}
				</span>
				Voltar
			</a>
			<a
				className={buttonVariants({
					className:
						"justify-center rounded-full border-[#e7ddd8] bg-white px-4 text-[#3d2926] shadow-none hover:bg-[#faf7f5]",
					variant: "outline",
				})}
				href={`/g/${props.guestSessionToken}/orders`}
			>
				Meus pedidos
			</a>
			<div className="ml-auto hidden rounded-full border border-[#ebddd9] bg-white/92 px-3 py-2 text-[#7d6660] text-[13px] shadow-[0_18px_32px_-28px_rgba(92,58,50,0.28)] sm:inline-flex">
				Sessao ativa
			</div>
		</div>
	);
}
