import { Badge } from "@finchat/ui/badge";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@finchat/ui/card";
import { Suspense } from "react";
import { AuthShowcase } from "./_components/auth-showcase";
import { PageShell } from "./_components/page-shell";

export default function HomePage() {
	return (
		<PageShell containerClassName="justify-center">
			<div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
				<section className="space-y-6">
					<Badge className="rounded-full px-3 py-1" variant="secondary">
						Room service digital
					</Badge>
					<div className="space-y-4">
						<h1 className="max-w-3xl font-semibold text-5xl tracking-tight md:text-6xl">
							Operação de hotel com experiência premium para hóspedes e equipe.
						</h1>
						<p className="max-w-2xl text-base text-muted-foreground md:text-lg">
							O FinChat conecta menu digital, criação de pedidos, rastreamento em
							tempo real e painel operacional em uma experiência mais clara, rápida
							e elegante.
						</p>
					</div>
					<div className="grid gap-4 sm:grid-cols-2">
						<Card className="border-primary/15 bg-card/85 backdrop-blur-sm">
							<CardHeader>
								<CardTitle>Fluxo do hóspede</CardTitle>
								<CardDescription>
									QR do quarto, cardápio mobile, pedido guiado e tracking ao vivo.
								</CardDescription>
							</CardHeader>
						</Card>
						<Card className="border-primary/15 bg-card/85 backdrop-blur-sm">
							<CardHeader>
								<CardTitle>Fluxo do staff</CardTitle>
								<CardDescription>
									Fila operacional, catálogo administrável e atualizações de status.
								</CardDescription>
							</CardHeader>
						</Card>
					</div>
				</section>

				<Suspense>
					<AuthShowcase />
				</Suspense>
			</div>
		</PageShell>
	);
}
