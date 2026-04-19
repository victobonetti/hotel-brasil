import { Badge } from "@nowait24/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@nowait24/ui/card";

import { PageShell } from "./page-shell";
import {
	BedIcon,
	BuildingIcon,
	ClockIcon,
	LinkIcon,
	PackageIcon,
	ShieldIcon,
	UtensilsIcon,
} from "./ui-icons";

const promisePoints = [
	{
		label: "Fluxo de pedido",
		value: "QR no quarto, carrinho no celular, pedido pronto para agir",
	},
	{
		label: "Visibilidade operacional",
		value: "Fila unica para staff, quartos e cardapio no mesmo ritmo",
	},
	{
		label: "Percepcao de marca",
		value: "Uma experiencia mais profissional para o hospede",
	},
];

const frictions = [
	{
		description:
			"Chamadas para recepcao e pedidos sem contexto quebram o ritmo da equipe e deixam a experiencia inconsistente.",
		icon: ClockIcon,
		title: "Menos interrupcao operacional",
	},
	{
		description:
			"Quando menu, disponibilidade e pedido vivem separados, a equipe improvisa e a venda perde velocidade.",
		icon: PackageIcon,
		title: "Menos improviso no atendimento",
	},
	{
		description:
			"A mesma plataforma organiza quartos, links publicos e catalogo para o hotel operar com mais previsibilidade.",
		icon: BuildingIcon,
		title: "Mais controle num painel unico",
	},
];

const workflow = [
	{
		description:
			"O hospede escaneia o QR do quarto e entra em um menu mobile direto, sem depender de telefone ou papel.",
		icon: LinkIcon,
		step: "01",
		title: "Abertura imediata",
	},
	{
		description:
			"Os itens sao escolhidos no celular com clareza de preco, contexto e revisao antes do envio.",
		icon: UtensilsIcon,
		step: "02",
		title: "Pedido com autonomia",
	},
	{
		description:
			"A equipe recebe o pedido com quarto, horario e status em uma fila pronta para preparar e entregar.",
		icon: BedIcon,
		step: "03",
		title: "Resposta com contexto",
	},
];

const operationalGains = [
	"Mais receita em room service com menos friccao no pedido.",
	"Mais legibilidade para acompanhar o que entrou, o que esta em preparo e o que ja saiu.",
	"Mais consistencia entre experiencia do hospede e execucao da equipe.",
];

const visibilityStats = [
	{ label: "Acesso do hospede", value: "QR por quarto" },
	{ label: "Leitura da operacao", value: "Fila central" },
	{ label: "Atualizacao do menu", value: "Catalogo vivo" },
];

export function HomeLandingView(props: { authSlot: React.ReactNode }) {
	return (
		<PageShell
			className="overflow-hidden bg-[radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--primary)_12%,transparent)_0%,transparent_38%),radial-gradient(circle_at_82%_12%,color-mix(in_oklab,var(--accent)_45%,white_55%)_0%,transparent_22%),linear-gradient(180deg,color-mix(in_oklab,var(--background)_95%,white_5%)_0%,color-mix(in_oklab,var(--background)_98%,var(--secondary)_2%)_100%)]"
			containerClassName="gap-8 px-4 py-5 md:gap-12 md:px-8 md:py-8"
		>
			<header className="rounded-[2rem] border border-border/70 bg-card/82 px-4 py-3 shadow-[0_30px_70px_-54px_color-mix(in_oklab,var(--foreground)_18%,transparent)] backdrop-blur-md md:px-5">
				<div className="grid gap-4 lg:grid-cols-[minmax(16rem,0.95fr)_minmax(15rem,0.85fr)_minmax(17rem,0.8fr)] lg:items-center">
					<a
						aria-label="NoWait24 inicio"
						className="group flex items-center gap-3 rounded-[1.7rem] border border-border/60 bg-background/78 px-3 py-3 transition hover:bg-background"
						href="/"
					>
						<div className="flex size-14 shrink-0 items-center justify-center rounded-[1.35rem] bg-[linear-gradient(180deg,color-mix(in_oklab,var(--primary)_18%,white_82%)_0%,color-mix(in_oklab,var(--accent)_52%,white_48%)_100%)] text-primary shadow-[0_20px_34px_-24px_color-mix(in_oklab,var(--primary)_42%,transparent)] transition group-hover:scale-[1.02]">
							<BedIcon className="size-5" />
						</div>
						<div className="min-w-0 space-y-1">
							<div className="flex flex-wrap items-center gap-2">
								<p className="font-semibold text-[1.2rem] leading-none tracking-[-0.04em]">
									NoWait24
								</p>
								<span className="rounded-full border border-primary/14 bg-primary/8 px-2.5 py-1 font-medium text-[10px] text-primary uppercase tracking-[0.18em]">
									Marca
								</span>
							</div>
							<p className="max-w-[24ch] text-[11px] text-muted-foreground uppercase tracking-[0.24em]">
								Plataforma de room service
							</p>
						</div>
					</a>

					<nav className="flex flex-wrap items-center justify-start gap-2 text-muted-foreground text-sm lg:justify-center">
						<a
							className="rounded-full px-3 py-1.5 transition hover:bg-accent hover:text-accent-foreground"
							href="#plataforma"
						>
							Plataforma
						</a>
						<a
							className="rounded-full px-3 py-1.5 transition hover:bg-accent hover:text-accent-foreground"
							href="#impacto"
						>
							Impacto
						</a>
						<a
							className="rounded-full px-3 py-1.5 transition hover:bg-accent hover:text-accent-foreground"
							href="#fechamento"
						>
							Proxima etapa
						</a>
					</nav>

					<div className="rounded-[1.7rem] border border-[#ead8d1] bg-white/92 p-3 shadow-[0_18px_40px_-34px_rgba(86,59,52,0.24)]">
						<div className="flex items-start gap-3">
							<div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/8 text-primary">
								<ShieldIcon className="size-4.5" />
							</div>
							<div className="min-w-0 flex-1 space-y-2">
								<div className="space-y-0.5">
									<p className="text-[10px] text-foreground/60 uppercase tracking-[0.22em]">
										Acesso da equipe
									</p>
									<p className="text-foreground/72 text-sm">
										Entrar ou abrir o painel administrativo.
									</p>
								</div>
								<div className="flex items-center lg:justify-end">
									{props.authSlot}
								</div>
							</div>
						</div>
					</div>
				</div>
			</header>

			<section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)] lg:items-stretch">
				<div className="relative overflow-hidden rounded-[2.25rem] border border-border/70 bg-[linear-gradient(145deg,color-mix(in_oklab,var(--card)_88%,white_12%)_0%,color-mix(in_oklab,var(--secondary)_38%,white_62%)_100%)] p-6 shadow-[0_36px_100px_-54px_color-mix(in_oklab,var(--primary)_20%,transparent)] md:p-8 lg:p-10">
					<div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />
					<div className="absolute right-0 bottom-0 size-48 rounded-full bg-primary/10 blur-3xl" />
					<div className="relative flex h-full flex-col justify-between gap-8">
						<div className="space-y-5">
							<Badge className="w-fit rounded-full border border-primary/12 bg-background/85 px-4 py-1.5 text-primary shadow-none hover:bg-background/85">
								NoWait24 para hoteis que querem vender melhor
							</Badge>

							<div className="space-y-5">
								<h1 className="max-w-4xl font-semibold text-[clamp(3.2rem,8vw,6.5rem)] text-foreground leading-[0.9] tracking-[-0.06em]">
									O room service que aumenta a receita sem aumentar o caos da
									operacao.
								</h1>
								<p className="max-w-2xl text-base text-foreground/72 leading-7 md:text-lg">
									Uma experiencia premium para o hospede, com menu mobile,
									carrinho claro e uma fila operacional que ajuda o hotel a
									receber, preparar e entregar com mais previsibilidade.
								</p>
							</div>
						</div>

						<div className="flex flex-col gap-3 sm:flex-row">
							<a
								className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-6 font-medium text-background transition duration-300 hover:-translate-y-0.5 hover:bg-foreground/92"
								href="#plataforma"
							>
								Conhecer a plataforma
							</a>
							<a
								className="inline-flex h-12 items-center justify-center rounded-full border border-primary/16 bg-background/82 px-6 font-medium text-foreground transition duration-300 hover:-translate-y-0.5 hover:bg-background"
								href="/staff/orders"
							>
								Acessar painel
							</a>
						</div>

						<div className="grid gap-3 md:grid-cols-3">
							{promisePoints.map((point) => (
								<div
									className="rounded-[1.6rem] border border-white/70 bg-background/80 p-4 shadow-[0_20px_36px_-30px_color-mix(in_oklab,var(--foreground)_18%,transparent)] backdrop-blur-sm"
									key={point.label}
								>
									<p className="text-[11px] text-muted-foreground uppercase tracking-[0.18em]">
										{point.label}
									</p>
									<p className="mt-3 text-foreground/80 text-sm leading-6">
										{point.value}
									</p>
								</div>
							))}
						</div>
					</div>
				</div>

				<div className="grid gap-4">
					<Card className="overflow-hidden rounded-[2rem] border-border/70 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--card)_92%,white_8%)_0%,color-mix(in_oklab,var(--background)_95%,var(--secondary)_5%)_100%)] shadow-[0_34px_84px_-56px_color-mix(in_oklab,var(--primary)_28%,transparent)]">
						<CardHeader className="gap-4 pb-0">
							<div className="flex items-center justify-between gap-3">
								<Badge className="rounded-full border border-primary/10 bg-primary/8 px-3 py-1 text-primary shadow-none hover:bg-primary/8">
									Visao da operacao
								</Badge>
								<p className="text-[11px] text-muted-foreground uppercase tracking-[0.2em]">
									Da leitura do QR ate a entrega
								</p>
							</div>
							<div className="space-y-2">
								<CardTitle className="text-3xl text-foreground tracking-[-0.04em]">
									Uma jornada unica para hospede e staff.
								</CardTitle>
								<CardDescription className="max-w-md text-foreground/68 text-sm leading-6">
									A landing vende um produto que organiza dois lados da mesma
									experiencia: quem pede no quarto e quem precisa executar com
									rapidez.
								</CardDescription>
							</div>
						</CardHeader>
						<CardContent className="grid gap-3 p-6 pt-5">
							{workflow.map((item) => {
								const Icon = item.icon;

								return (
									<div
										className="grid gap-4 rounded-[1.5rem] border border-border/65 bg-background/90 p-4 md:grid-cols-[auto_1fr]"
										key={item.step}
									>
										<div className="flex items-center gap-3">
											<div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
												<Icon className="size-5" />
											</div>
											<div className="flex size-10 items-center justify-center rounded-full bg-secondary font-medium text-secondary-foreground text-sm">
												{item.step}
											</div>
										</div>
										<div className="space-y-1">
											<p className="font-medium text-lg tracking-tight">
												{item.title}
											</p>
											<p className="text-muted-foreground text-sm leading-6">
												{item.description}
											</p>
										</div>
									</div>
								);
							})}
						</CardContent>
					</Card>

					<div className="grid gap-3 sm:grid-cols-3">
						{visibilityStats.map((item) => (
							<div
								className="rounded-[1.6rem] border border-border/70 bg-card/85 p-4 shadow-[0_18px_40px_-34px_color-mix(in_oklab,var(--foreground)_16%,transparent)]"
								key={item.label}
							>
								<p className="text-2xl text-foreground tracking-[-0.04em]">
									{item.value}
								</p>
								<p className="mt-2 text-muted-foreground text-sm">
									{item.label}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(20rem,1.05fr)] lg:items-start">
				<div className="space-y-5">
					<Badge className="w-fit rounded-full border border-primary/10 bg-primary/8 px-3 py-1.5 text-primary shadow-none hover:bg-primary/8">
						Porque isso vende melhor
					</Badge>
					<div className="space-y-4">
						<h2 className="max-w-3xl text-[clamp(2.4rem,5vw,4.6rem)] text-foreground leading-[0.95] tracking-[-0.05em]">
							Quando a operacao fica legivel, o room service parece parte do
							hotel e nao um improviso.
						</h2>
						<p className="max-w-2xl text-base text-foreground/72 leading-7 md:text-lg">
							A proposta comercial da NoWait24 e simples: tirar atrito do
							pedido, reduzir ruido para a equipe e elevar a percepcao de
							cuidado no atendimento dentro do quarto.
						</p>
					</div>
				</div>

				<div className="grid gap-3 md:grid-cols-3">
					{frictions.map((item) => {
						const Icon = item.icon;

						return (
							<Card
								className="rounded-[1.7rem] border-border/70 bg-card/86 shadow-[0_28px_54px_-42px_color-mix(in_oklab,var(--foreground)_18%,transparent)]"
								key={item.title}
							>
								<CardHeader className="gap-4">
									<div className="flex size-12 items-center justify-center rounded-2xl bg-[linear-gradient(180deg,color-mix(in_oklab,var(--primary)_14%,white_86%)_0%,color-mix(in_oklab,var(--accent)_42%,white_58%)_100%)] text-primary">
										<Icon className="size-5" />
									</div>
									<div className="space-y-2">
										<CardTitle className="text-foreground text-xl tracking-tight">
											{item.title}
										</CardTitle>
										<CardDescription className="text-muted-foreground text-sm leading-6">
											{item.description}
										</CardDescription>
									</div>
								</CardHeader>
							</Card>
						);
					})}
				</div>
			</section>

			<section
				className="grid gap-6 rounded-[2.2rem] border border-border/70 bg-[linear-gradient(140deg,color-mix(in_oklab,var(--card)_92%,white_8%)_0%,color-mix(in_oklab,var(--secondary)_42%,white_58%)_100%)] p-6 shadow-[0_34px_90px_-58px_color-mix(in_oklab,var(--primary)_22%,transparent)] md:p-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(20rem,1.1fr)]"
				id="plataforma"
			>
				<div className="space-y-4">
					<Badge className="w-fit rounded-full border border-background/80 bg-background/88 px-3 py-1.5 text-primary shadow-none hover:bg-background/88">
						Como funciona na pratica
					</Badge>
					<h2 className="max-w-xl text-[clamp(2.4rem,5vw,4.4rem)] text-foreground leading-[0.96] tracking-[-0.05em]">
						Da descoberta no quarto ate a entrega, tudo conversa no mesmo fluxo.
					</h2>
					<p className="max-w-xl text-base text-foreground/72 leading-7 md:text-lg">
						O hotel ganha um produto que faz sentido para quem pede e para quem
						opera. Isso melhora a jornada do hospede sem adicionar uma camada
						extra de complexidade ao staff.
					</p>
				</div>

				<Card className="rounded-[1.8rem] border-border/65 bg-background/92 shadow-none">
					<CardContent className="grid gap-4 p-6">
						{operationalGains.map((gain) => (
							<div
								className="flex items-start gap-3 rounded-[1.4rem] border border-border/65 bg-card/88 p-4"
								key={gain}
							>
								<div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
									<ShieldIcon className="size-4" />
								</div>
								<p className="text-foreground/80 text-sm leading-6 md:text-base">
									{gain}
								</p>
							</div>
						))}
					</CardContent>
				</Card>
			</section>

			<section
				className="grid gap-5 rounded-[2.2rem] border border-border/70 bg-foreground px-6 py-8 text-background shadow-[0_36px_96px_-58px_color-mix(in_oklab,var(--foreground)_45%,transparent)] md:px-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"
				id="impacto"
			>
				<div className="space-y-4">
					<Badge className="w-fit rounded-full border border-white/12 bg-white/10 px-3 py-1.5 text-white shadow-none hover:bg-white/10">
						Impacto percebido
					</Badge>
					<h2 className="max-w-3xl text-[clamp(2.2rem,4.8vw,4.2rem)] text-white leading-[0.95] tracking-[-0.05em]">
						A plataforma ajuda o hotel a parecer mais organizado porque a
						operacao realmente fica mais organizada.
					</h2>
					<p className="max-w-2xl text-base text-white/72 leading-7 md:text-lg">
						Esse e o tipo de produto que melhora a experiencia do hospede ao
						mesmo tempo em que simplifica a rotina da equipe. A venda deixa de
						ser informal e passa a ser parte clara do servico.
					</p>
				</div>

				<div className="grid gap-3 sm:grid-cols-3 lg:min-w-[28rem]">
					{visibilityStats.map((item) => (
						<div
							className="rounded-[1.5rem] border border-white/12 bg-white/8 p-4"
							key={`impact-${item.label}`}
						>
							<p className="text-2xl text-white tracking-[-0.04em]">
								{item.value}
							</p>
							<p className="mt-2 text-sm text-white/62">{item.label}</p>
						</div>
					))}
				</div>
			</section>

			<section
				className="grid gap-5 rounded-[2.2rem] border border-border/70 bg-card/82 p-6 shadow-[0_34px_86px_-60px_color-mix(in_oklab,var(--primary)_20%,transparent)] md:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
				id="fechamento"
			>
				<div className="space-y-3">
					<Badge className="w-fit rounded-full border border-primary/10 bg-primary/8 px-3 py-1.5 text-primary shadow-none hover:bg-primary/8">
						Fechamento
					</Badge>
					<h2 className="text-[clamp(2.2rem,4vw,3.8rem)] text-foreground leading-[0.98] tracking-[-0.05em]">
						Pronto para profissionalizar o room service do hotel?
					</h2>
					<p className="max-w-2xl text-base text-foreground/72 leading-7 md:text-lg">
						A landing agora posiciona a NoWait24 como uma camada comercial e
						operacional do hotel: mais clara para vender, mais forte para
						executar e mais memoravel para o hospede.
					</p>
				</div>

				<div className="flex flex-col gap-3 sm:flex-row">
					<a
						className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 font-medium text-primary-foreground transition duration-300 hover:-translate-y-0.5 hover:bg-primary/92"
						href="#plataforma"
					>
						Rever a plataforma
					</a>
					<a
						className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-background px-6 font-medium text-foreground transition duration-300 hover:-translate-y-0.5 hover:bg-accent"
						href="/staff/orders"
					>
						Entrar no painel interno
					</a>
				</div>
			</section>
		</PageShell>
	);
}
