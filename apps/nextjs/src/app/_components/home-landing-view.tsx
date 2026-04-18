import { Badge } from "@nowait24/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@nowait24/ui/card";

import { PageShell } from "./page-shell";
import {
	BedIcon,
	BuildingIcon,
	ClockIcon,
	GridIcon,
	LinkIcon,
	PackageIcon,
	ShieldIcon,
	UtensilsIcon,
} from "./ui-icons";

const outcomes = [
	{
		label: "Pedidos sem atrito",
		value: "QR por quarto",
	},
	{
		label: "Resposta do staff",
		value: "Fila central",
	},
	{
		label: "Operacao continua",
		value: "Menu sempre vivo",
	},
];

const experiencePillars = [
	{
		description:
			"O hospede escaneia o QR do quarto, abre o menu mobile e faz o pedido sem chamar recepcao.",
		icon: LinkIcon,
		title: "O pedido sai do quarto com contexto",
	},
	{
		description:
			"A equipe recebe tudo com quarto, observacoes e prioridade em uma visao unica de operacao.",
		icon: ClockIcon,
		title: "A fila chega pronta para agir",
	},
	{
		description:
			"Cardapio, disponibilidade e acessos dos quartos ficam no mesmo sistema que acompanha os pedidos.",
		icon: GridIcon,
		title: "O painel continua atualizado",
	},
];

const featureColumns = [
	{
		description:
			"Menu pensado para toque, leitura rapida e decisao em poucos segundos no celular do hospede.",
		icon: UtensilsIcon,
		title: "Experiencia mobile first",
	},
	{
		description:
			"Quadro operacional claro para acompanhar novos pedidos, preparo e entrega sem trocar de tela.",
		icon: PackageIcon,
		title: "Painel que reduz improviso",
	},
	{
		description:
			"Quartos, links e itens do menu administrados com a mesma logica do dia a dia do hotel.",
		icon: BuildingIcon,
		title: "Administracao simples",
	},
];

const results = [
	"Menos chamadas manuais para recepcao e cozinha",
	"Mais previsibilidade para a equipe durante picos",
	"Mais clareza para o hospede antes e depois do pedido",
];

export function HomeLandingView(props: { authSlot: React.ReactNode }) {
	return (
		<PageShell
			className="overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(202,94,59,0.14),_transparent_30%),linear-gradient(180deg,_#fff8f1_0%,_#fffdfb_50%,_#fff6ef_100%)]"
			containerClassName="gap-10 px-4 py-5 md:px-8 md:py-8"
		>
			<header className="rounded-[1.8rem] border border-[#ead8d0] bg-white/72 px-4 py-3 shadow-[0_20px_44px_-36px_rgba(86,59,52,0.22)] backdrop-blur-md md:px-5">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-3">
						<div className="flex size-13 items-center justify-center rounded-[1.4rem] bg-[linear-gradient(180deg,#fff1ea_0%,#ffe0d0_100%)] text-[#bc6049] shadow-[0_18px_32px_-24px_rgba(188,96,73,0.55)]">
							<BedIcon className="size-5" />
						</div>
						<div className="space-y-0.5">
							<p className="font-semibold text-[#2f1e1a] text-[1.05rem] tracking-[-0.03em]">
								NoWait24
							</p>
							<p className="text-[#7c655d] text-[11px] uppercase tracking-[0.18em]">
								Room service para hoteis
							</p>
						</div>
					</div>
					<div className="flex items-center sm:justify-end">
						{props.authSlot}
					</div>
				</div>
			</header>

			<section className="relative overflow-hidden rounded-[2rem] border border-[#ead8d0] bg-[linear-gradient(135deg,#fffdfb_0%,#fff3ea_52%,#ffe6d7_100%)] p-6 shadow-[0_30px_100px_-46px_rgba(111,67,54,0.4)] md:p-8">
				<div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#d57a5d]/50 to-transparent" />
				<div className="absolute -top-8 right-0 size-40 rounded-full bg-[#efb39d]/35 blur-3xl" />
				<div className="relative space-y-7">
					<div className="space-y-4">
						<Badge className="rounded-full border-0 bg-white/84 px-4 py-1.5 text-[#8a563f] shadow-sm hover:bg-white/84">
							Room service para hoteis que querem operar melhor
						</Badge>
						<div className="space-y-4">
							<h1 className="max-w-4xl font-semibold text-[#261714] text-[clamp(3rem,7vw,6rem)] leading-[0.94] tracking-[-0.05em]">
								Pedidos do quarto ao staff em um fluxo que faz sentido.
							</h1>
							<p className="max-w-2xl text-[#735b53] text-base leading-7 md:text-lg">
								O NoWait24 ajuda hoteis a vender room service com mais clareza:
								menu mobile para o hospede, fila visivel para a equipe e um
								painel que organiza quartos, pedidos e catalogo sem ruido.
							</p>
						</div>
					</div>

					<div className="flex flex-wrap gap-3">
						<a
							className="inline-flex items-center justify-center rounded-full bg-[#251714] px-5 py-3 font-medium text-sm text-white transition hover:-translate-y-0.5 hover:bg-[#1c100d]"
							href="#como-funciona"
						>
							Ver a operacao
						</a>
						<a
							className="inline-flex items-center justify-center rounded-full border border-[#e7d7cf] bg-white/84 px-5 py-3 font-medium text-[#3d2a25] text-sm transition hover:bg-white"
							href="#beneficios"
						>
							Ver beneficios
						</a>
					</div>

					<div className="grid gap-3 md:grid-cols-3">
						{outcomes.map((outcome) => (
							<div
								className="rounded-[1.5rem] border border-white/70 bg-white/72 p-4 shadow-[0_18px_40px_-34px_rgba(86,59,52,0.3)] backdrop-blur-sm transition hover:-translate-y-0.5"
								key={outcome.label}
							>
								<p className="font-semibold text-2xl text-[#261714] tracking-tight">
									{outcome.value}
								</p>
								<p className="mt-1 text-[#7b635b] text-sm">{outcome.label}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			<section
				className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.95fr)]"
				id="como-funciona"
			>
				<div className="space-y-4">
					<Badge className="rounded-full border-0 bg-[#fff0e8] px-3 py-1.5 text-[#a45740] hover:bg-[#fff0e8]">
						Como a operacao flui
					</Badge>
					<h2 className="max-w-3xl font-semibold text-3xl text-[#261714] tracking-tight md:text-5xl">
						O hospede pede com rapidez. O hotel responde com contexto.
					</h2>
					<p className="max-w-2xl text-[#78615a] text-base leading-7 md:text-lg">
						A landing precisa vender esse encaixe: a jornada do hospede e a
						rotina da equipe vivem na mesma plataforma, sem remendos nem
						transferencia manual de informacao.
					</p>
				</div>

				<div className="grid gap-3">
					{experiencePillars.map((pillar) => {
						const Icon = pillar.icon;

						return (
							<Card
								className="border-[#ead9d2] bg-[#fffdfb] shadow-[0_24px_44px_-38px_rgba(86,59,52,0.28)] transition duration-300 hover:-translate-y-1 hover:border-[#d17a5d]"
								key={pillar.title}
							>
								<CardHeader className="gap-4">
									<div className="flex size-11 items-center justify-center rounded-2xl bg-[#fff1ea] text-[#b45a43] transition group-hover:scale-105">
										<Icon className="size-5" />
									</div>
									<div className="space-y-2">
										<CardTitle className="text-2xl text-[#261714]">
											{pillar.title}
										</CardTitle>
										<p className="text-[#7a635c] text-sm leading-6 md:text-base">
											{pillar.description}
										</p>
									</div>
								</CardHeader>
							</Card>
						);
					})}
				</div>
			</section>

			<section
				className="grid gap-6 rounded-[2rem] border border-[#e7d7cf] bg-[linear-gradient(135deg,#fffdfb_0%,#fff7f1_100%)] p-6 shadow-[0_26px_56px_-44px_rgba(86,59,52,0.26)] md:p-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
				id="beneficios"
			>
				<div className="space-y-4">
					<Badge className="rounded-full border border-[#e6d3cb] bg-white px-3 py-1.5 text-[#8a563f] shadow-none hover:bg-white">
						O que muda no dia a dia
					</Badge>
					<h2 className="max-w-xl font-semibold text-3xl text-[#261714] tracking-tight md:text-4xl">
						Menos improviso para o hotel. Mais percepcao de cuidado para o
						hospede.
					</h2>
					<p className="max-w-xl text-[#78615a] text-base leading-7 md:text-lg">
						A homepage precisa fechar a venda com clareza: um sistema unico que
						transforma room service em uma operacao mais legivel, mais rapida e
						mais profissional.
					</p>
					<div className="grid gap-3 sm:grid-cols-3">
						{featureColumns.map((feature) => {
							const Icon = feature.icon;

							return (
								<div
									className="rounded-[1.35rem] border border-[#ead8d1] bg-white/86 p-4"
									key={feature.title}
								>
									<div className="flex size-10 items-center justify-center rounded-2xl bg-[#fff1ea] text-[#b45a43]">
										<Icon className="size-4" />
									</div>
									<p className="mt-3 font-medium text-[#261714] text-sm">
										{feature.title}
									</p>
								</div>
							);
						})}
					</div>
				</div>

				<Card className="border-[#ead8d1] bg-white/84 shadow-none">
					<CardContent className="grid gap-4 p-6">
						{results.map((result) => (
							<div
								className="flex items-start gap-3 rounded-[1.35rem] border border-[#efe0da] bg-[linear-gradient(180deg,#ffffff_0%,#fff8f4_100%)] p-4 transition duration-300 hover:-translate-y-0.5"
								key={result}
							>
								<div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#fff1ea] text-[#b45a43]">
									<ShieldIcon className="size-4" />
								</div>
								<p className="text-[#35211d] text-sm leading-6 md:text-base">
									{result}
								</p>
							</div>
						))}
					</CardContent>
				</Card>
			</section>
		</PageShell>
	);
}
