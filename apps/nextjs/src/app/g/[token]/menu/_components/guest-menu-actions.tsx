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
		</div>
	);
}
