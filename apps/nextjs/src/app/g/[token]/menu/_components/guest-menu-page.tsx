"use client";

import { Badge } from "@finchat/ui/badge";
import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/react";
import { CategorySection } from "./category-section";
import { GuestSessionGuard } from "./guest-session-guard";

function formatSessionExpiry(expiresAt: Date) {
	return new Intl.DateTimeFormat("pt-BR", {
		dateStyle: "short",
		timeStyle: "short",
	}).format(expiresAt);
}

export function GuestMenuPage(props: { guestSessionToken: string }) {
	const trpc = useTRPC();
	const menuQuery = useQuery(
		trpc.menu.getMenuForGuestSession.queryOptions({
			guestSessionToken: props.guestSessionToken,
		}),
	);

	return (
		<main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_38%),linear-gradient(180deg,_rgba(255,255,255,1),_rgba(248,250,252,1))]">
			<div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 md:px-8 md:py-14">
				<GuestSessionGuard
					errorMessage={menuQuery.error?.message}
					isLoading={menuQuery.isLoading}
				>
					<div className="space-y-8">
						<header className="space-y-4">
							<Badge variant="outline">Menu digital</Badge>
							<div className="space-y-2">
								<h1 className="font-semibold text-4xl tracking-tight md:text-5xl">
									Cardápio do quarto
								</h1>
								<p className="max-w-2xl text-base text-muted-foreground md:text-lg">
									Veja os itens disponíveis do seu hotel e acompanhe tudo sem
									precisar ligar para a recepção.
								</p>
							</div>

							{menuQuery.data ? (
								<div className="flex flex-wrap items-center gap-3 text-muted-foreground text-sm">
									<Badge variant="secondary">
										Quarto {menuQuery.data.guestSession.roomId}
									</Badge>
									<span>
										Sessão válida até{" "}
										{formatSessionExpiry(menuQuery.data.guestSession.expiresAt)}
									</span>
								</div>
							) : null}
						</header>

						<div className="space-y-8">
							{menuQuery.data?.categories.map((category) => (
								<CategorySection category={category} key={category.id} />
							))}
						</div>
					</div>
				</GuestSessionGuard>
			</div>
		</main>
	);
}
