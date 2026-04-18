import { buttonVariants } from "@nowait24/ui/button";

export function GuestMenuActions(props: { guestSessionToken: string }) {
	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center">
				<a
					className={buttonVariants({
						className:
							"justify-center rounded-full border-white/80 bg-white/90 px-4 text-slate-900 shadow-sm backdrop-blur hover:bg-white",
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
							"justify-center rounded-full border-[#ffd7d2] bg-[#fff3f1] px-4 text-[#b42318] shadow-sm hover:bg-[#ffe8e3]",
						variant: "outline",
					})}
					href={`/g/${props.guestSessionToken}/orders`}
				>
					Meus pedidos
				</a>
			</div>
			<div className="inline-flex items-center gap-2 self-start rounded-full bg-white/85 px-3 py-2 text-[13px] text-slate-600 shadow-sm backdrop-blur">
				<span
					aria-hidden="true"
					className="inline-block size-2 rounded-full bg-[#ea1d2c]"
				/>
				Entrega no quarto
			</div>
		</div>
	);
}
