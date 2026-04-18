import { Badge } from "@nowait24/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@nowait24/ui/card";
import { PageShell } from "./page-shell";
import {
	ArrowDownIcon,
	ClockIcon,
	GridIcon,
	PackageIcon,
	ShieldIcon,
	UtensilsIcon,
} from "./ui-icons";

const metrics = [
	{ label: "Pontos de contato", value: "1 fluxo unico" },
	{ label: "Tempo de resposta", value: "mais previsivel" },
	{ label: "Visao do staff", value: "operacao centralizada" },
];

const journeySteps = [
	{
		description:
			"O hospede escaneia o QR do quarto e entra em um menu mobile objetivo, bonito e rapido.",
		title: "1. Entrada sem atrito",
	},
	{
		description:
			"Cada pedido nasce com contexto do quarto, observacoes e status visivel durante toda a jornada.",
		title: "2. Pedido guiado",
	},
	{
		description:
			"A equipe acompanha a fila, atualiza o andamento e mantem o hospede informado ate a entrega.",
		title: "3. Operacao sincronizada",
	},
];

const featureColumns = [
	{
		description:
			"Cardapio por categorias, destaque visual para itens e navegacao pensada para conversao em mobile.",
		icon: UtensilsIcon,
		title: "Experiencia do hospede",
	},
	{
		description:
			"Fila operacional com visao clara do que entrou, do que esta em preparo e do que precisa de acao agora.",
		icon: ClockIcon,
		title: "Painel operacional",
	},
	{
		description:
			"Categorias, itens, disponibilidade e quartos administrados pelo time sem depender de fluxos paralelos.",
		icon: GridIcon,
		title: "Administracao continua",
	},
];

const results = [
	"Menos ruido entre recepcao, cozinha e operacao",
	"Mais clareza para o hospede antes e depois do pedido",
	"Atalhos para o staff agir sem trocar de contexto",
];

export function HomeLandingView(props: { authSlot: React.ReactNode }) {
	return (
		<PageShell
			className="overflow-hidden"
			containerClassName="gap-16 px-4 py-6 md:px-8 md:py-10"
		>
			<header className="flex justify-end">{props.authSlot}</header>

			<section className="relative overflow-hidden rounded-[2rem] border border-white/45 bg-[linear-gradient(135deg,color-mix(in_oklab,var(--background)_65%,white_35%),color-mix(in_oklab,var(--accent)_22%,white_78%)_48%,color-mix(in_oklab,var(--primary)_18%,white_82%))] px-6 py-8 shadow-[0_30px_120px_-40px_color-mix(in_oklab,var(--primary)_45%,transparent)] md:px-10 md:py-10">
				<div className="absolute top-8 -right-10 h-40 w-40 rounded-full bg-primary/12 blur-3xl" />
				<div className="absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
				<div className="relative">
					<div className="space-y-8">
						<div className="space-y-5">
							<Badge className="rounded-full border-0 bg-white/70 px-4 py-1.5 text-foreground shadow-sm">
								Room service digital para hoteis
							</Badge>
							<div className="space-y-4">
								<p className="max-w-2xl font-semibold text-[clamp(2.75rem,7vw,5.75rem)] leading-[0.95] tracking-[-0.04em]">
									Uma landing pensada para vender a operacao antes mesmo do
									primeiro login.
								</p>
								<p className="max-w-2xl text-base text-foreground/72 md:text-lg">
									O NoWait24 apresenta o produto com a mesma clareza que entrega
									no dia a dia: menu digital para o hospede, acompanhamento em
									tempo real e um painel de administracao pronto para o staff
									operar sem friccao.
								</p>
							</div>
						</div>

						<div className="flex flex-wrap gap-3">
							<a
								className="inline-flex items-center justify-center rounded-full bg-foreground px-5 py-3 font-medium text-background transition hover:-translate-y-0.5"
								href="#como-funciona"
							>
								Ver como funciona
							</a>
							<a
								className="inline-flex items-center justify-center rounded-full border border-foreground/15 bg-white/70 px-5 py-3 font-medium text-foreground transition hover:bg-white"
								href="#resultados"
							>
								Explorar beneficios
							</a>
						</div>

						<div className="grid gap-3 md:grid-cols-3">
							{metrics.map((metric) => (
								<div
									className="rounded-[1.6rem] border border-white/65 bg-white/58 p-4 shadow-sm backdrop-blur-sm"
									key={metric.label}
								>
									<p className="font-semibold text-2xl tracking-tight">
										{metric.value}
									</p>
									<p className="mt-1 text-foreground/66 text-sm">
										{metric.label}
									</p>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			<section
				className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]"
				id="como-funciona"
			>
				<div className="space-y-5">
					<div className="space-y-3">
						<Badge className="rounded-full px-3 py-1" variant="secondary">
							Como funciona
						</Badge>
						<h2 className="max-w-3xl font-semibold text-3xl tracking-tight md:text-5xl">
							Do QR no quarto ao pedido entregue, tudo acontece dentro de um
							fluxo coerente.
						</h2>
						<p className="max-w-2xl text-base text-muted-foreground md:text-lg">
							A home deixa claro o valor do produto e prepara o visitante para o
							uso real: experiencia do hospede na frente, retaguarda operacional
							no mesmo sistema.
						</p>
					</div>

					<div className="space-y-3">
						{journeySteps.map((step) => (
							<Card
								className="border-border/70 bg-card/88 transition duration-300 hover:-translate-y-1 hover:border-primary/35"
								key={step.title}
							>
								<CardHeader className="gap-3">
									<div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
										<ArrowDownIcon className="size-4" />
									</div>
									<div className="space-y-1">
										<CardTitle className="text-xl">{step.title}</CardTitle>
										<p className="text-muted-foreground text-sm md:text-base">
											{step.description}
										</p>
									</div>
								</CardHeader>
							</Card>
						))}
					</div>
				</div>

				<div className="relative overflow-hidden rounded-[2rem] border border-primary/15 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--card)_90%,white_10%),color-mix(in_oklab,var(--background)_90%,var(--accent)_10%))] p-6 shadow-[0_25px_80px_-40px_color-mix(in_oklab,var(--primary)_35%,transparent)]">
					<div className="absolute inset-x-6 top-6 flex items-center gap-2">
						<div className="size-2.5 rounded-full bg-foreground/18" />
						<div className="size-2.5 rounded-full bg-foreground/12" />
						<div className="size-2.5 rounded-full bg-foreground/8" />
					</div>
					<div className="mt-10 space-y-4">
						<div className="rounded-[1.5rem] border border-primary/15 bg-background/78 p-4">
							<div className="flex items-center justify-between gap-4">
								<div>
									<p className="font-medium text-sm">Hospede</p>
									<p className="text-muted-foreground text-sm">
										Suite 504 pede o jantar
									</p>
								</div>
								<span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-xs">
									Novo pedido
								</span>
							</div>
						</div>
						<div className="grid gap-3 sm:grid-cols-2">
							<div className="rounded-[1.5rem] border border-border/70 bg-card/92 p-4">
								<p className="font-medium text-sm">Painel do staff</p>
								<p className="mt-2 text-muted-foreground text-sm">
									Status, fila priorizada e atualizacao em tempo real sem trocar
									de tela.
								</p>
							</div>
							<div className="rounded-[1.5rem] border border-border/70 bg-card/92 p-4">
								<p className="font-medium text-sm">Catalogo vivo</p>
								<p className="mt-2 text-muted-foreground text-sm">
									Disponibilidade, categorias e itens administrados direto no
									painel.
								</p>
							</div>
						</div>
						<div className="rounded-[1.5rem] border border-primary/15 bg-primary/[0.05] p-5">
							<div className="flex items-start gap-3">
								<div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
									<PackageIcon className="size-5" />
								</div>
								<div>
									<p className="font-medium">
										Visibilidade para toda a operacao
									</p>
									<p className="mt-1 text-muted-foreground text-sm">
										A mesma plataforma organiza pedidos, quartos e cardapio para
										que cada area aja com contexto.
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section className="grid gap-4 lg:grid-cols-3">
				{featureColumns.map((feature) => {
					const Icon = feature.icon;

					return (
						<Card
							className="group border-border/70 bg-card/88 transition duration-300 hover:-translate-y-1.5 hover:border-primary/35 hover:shadow-[0_22px_50px_-35px_color-mix(in_oklab,var(--primary)_45%,transparent)]"
							key={feature.title}
						>
							<CardHeader className="space-y-4">
								<div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition group-hover:scale-105 group-hover:bg-primary/14">
									<Icon className="size-5" />
								</div>
								<div className="space-y-2">
									<CardTitle className="text-2xl">{feature.title}</CardTitle>
									<p className="text-muted-foreground text-sm md:text-base">
										{feature.description}
									</p>
								</div>
							</CardHeader>
						</Card>
					);
				})}
			</section>

			<section
				className="grid gap-6 rounded-[2rem] border border-border/70 bg-card/72 p-6 md:p-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]"
				id="resultados"
			>
				<div className="space-y-4">
					<Badge className="rounded-full px-3 py-1" variant="outline">
						Resultados que a operacao sente
					</Badge>
					<h2 className="max-w-xl font-semibold text-3xl tracking-tight md:text-4xl">
						Menos improviso para o time. Mais percepcao de cuidado para o
						hospede.
					</h2>
					<p className="max-w-xl text-base text-muted-foreground md:text-lg">
						A landing deixa o produto explicito, mas o argumento central
						continua simples: um sistema unico para servir melhor e operar com
						mais confianca.
					</p>
				</div>

				<Card className="border-primary/15 bg-background/72 shadow-none">
					<CardContent className="grid gap-4 p-6">
						{results.map((result) => (
							<div
								className="flex items-start gap-3 rounded-[1.25rem] border border-border/70 bg-card/80 p-4"
								key={result}
							>
								<div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
									<ShieldIcon className="size-4" />
								</div>
								<p className="text-sm md:text-base">{result}</p>
							</div>
						))}
					</CardContent>
				</Card>
			</section>
		</PageShell>
	);
}
