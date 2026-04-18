import { Button } from "@nowait24/ui/button";

export function GuestMenuActions(props: { guestSessionToken: string }) {
	return (
		<div className="flex flex-wrap items-center justify-between gap-3">
			<div className="flex flex-wrap items-center gap-3">
				<Button
					className="rounded-full border-white/80 bg-white/85 px-4 text-slate-900 shadow-sm backdrop-blur hover:bg-white"
					render={<a href={`/g/${props.guestSessionToken}`} />}
					variant="outline"
				>
					<span aria-hidden="true" className="text-base leading-none">
						{"<"}
					</span>
					Voltar
				</Button>
				<Button
					className="rounded-full border-[#ffd7d2] bg-[#fff3f1] px-4 text-[#b42318] shadow-sm hover:bg-[#ffe8e3]"
					render={<a href={`/g/${props.guestSessionToken}/orders`} />}
					variant="outline"
				>
					Meus pedidos
				</Button>
			</div>
			<div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 text-[13px] text-slate-600 shadow-sm backdrop-blur">
				<span
					aria-hidden="true"
					className="inline-block size-2 rounded-full bg-[#ea1d2c]"
				/>
				Entrega no quarto
			</div>
		</div>
	);
}
