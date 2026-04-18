"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@nowait24/ui/alert-dialog";
import { Button } from "@nowait24/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@nowait24/ui/card";
import { Input } from "@nowait24/ui/input";
import { Label } from "@nowait24/ui/label";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { Route } from "next";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import { useEffect, useState } from "react";

import { PageShell, SectionHeader } from "~/app/_components/page-shell";
import { PaginationControls } from "~/app/_components/pagination-controls";
import {
	buildPageSearch,
	parsePageParam,
	shouldSyncPageParam,
} from "~/app/_components/pagination-state";
import { StaffNav } from "~/app/_components/staff-nav";
import {
	PackageIcon,
	PlusIcon,
	RefreshIcon,
	ToggleOffIcon,
	ToggleOnIcon,
} from "~/app/_components/ui-icons";
import { useTRPC } from "~/trpc/react";
import { StaffHotelGuard } from "../../orders/_components/staff-hotel-guard";
import { buildRoomPublicUrl } from "./room-public-url";
import { buildRoomQrCodeActionState } from "./room-qr-code-actions";

interface DraftRoomState {
	floor: string;
	label: string;
}

interface RoomQrPreview {
	dataUrl: string;
	downloadName: string;
	label: string;
	publicUrl: string;
	title: string;
}

function formatFloorLabel(floor: number | null) {
	return floor === null ? "Sem andar" : `Andar ${floor}`;
}

export function StaffRoomsPage() {
	const trpc = useTRPC();
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();
	const [newLabel, setNewLabel] = useState("");
	const [newFloor, setNewFloor] = useState("");
	const [formError, setFormError] = useState<string | null>(null);
	const [actionError, setActionError] = useState<string | null>(null);
	const [drafts, setDrafts] = useState<Record<string, DraftRoomState>>({});
	const [qrPreview, setQrPreview] = useState<RoomQrPreview | null>(null);
	const [qrPreviewError, setQrPreviewError] = useState<string | null>(null);
	const currentPage = parsePageParam(searchParams.get("page") ?? undefined);

	const roomsQuery = useQuery(
		trpc.roomAdmin.listRooms.queryOptions({
			page: currentPage,
		}),
	);

	let state: "loading" | "needs-auth" | "unauthorized" | undefined;
	if (roomsQuery.isLoading) {
		state = "loading";
	} else if (roomsQuery.error?.data?.code === "UNAUTHORIZED") {
		state = "needs-auth";
	} else if (roomsQuery.error) {
		state = "unauthorized";
	}

	const createRoomMutation = useMutation(
		trpc.roomAdmin.createRoom.mutationOptions({
			onError: (error) => {
				setFormError(error.message);
			},
			onSuccess: async () => {
				setFormError(null);
				setNewFloor("");
				setNewLabel("");
				await roomsQuery.refetch();
			},
		}),
	);

	const updateRoomMutation = useMutation(
		trpc.roomAdmin.updateRoom.mutationOptions({
			onError: (error) => {
				setActionError(error.message);
			},
			onSuccess: async () => {
				setActionError(null);
				await roomsQuery.refetch();
			},
		}),
	);

	const regenerateTokenMutation = useMutation(
		trpc.roomAdmin.regenerateRoomToken.mutationOptions({
			onError: (error) => {
				setActionError(error.message);
			},
			onSuccess: async () => {
				setActionError(null);
				await roomsQuery.refetch();
			},
		}),
	);

	const rooms = roomsQuery.data?.items ?? [];
	const pagination = roomsQuery.data?.pagination;

	useEffect(() => {
		if (!pagination || !shouldSyncPageParam(currentPage, pagination)) {
			return;
		}

		const nextSearch = buildPageSearch(
			new URLSearchParams(searchParams.toString()),
			"page",
			pagination.page,
		);
		router.replace(
			(nextSearch.length > 0 ? `${pathname}?${nextSearch}` : pathname) as Route,
			{
				scroll: false,
			},
		);
	}, [currentPage, pagination, pathname, router, searchParams]);

	function parseFloorValue(value: string) {
		const trimmedValue = value.trim();
		if (trimmedValue.length === 0) {
			return null;
		}

		return Number(trimmedValue);
	}

	async function copyRoomUrl(qrCodeToken: string) {
		try {
			const roomUrl = buildRoomPublicUrl(window.location.origin, qrCodeToken);
			await navigator.clipboard.writeText(roomUrl);
			setActionError(null);
		} catch {
			setActionError("Nao foi possivel copiar o link deste quarto.");
		}
	}

	async function openRoomQrPreview(input: {
		label: string;
		qrCodeToken: string;
	}) {
		try {
			const publicUrl = buildRoomPublicUrl(
				window.location.origin,
				input.qrCodeToken,
			);
			const actionState = buildRoomQrCodeActionState(input);
			const dataUrl = await QRCode.toDataURL(publicUrl, {
				margin: 1,
				width: 720,
			});

			setQrPreview({
				dataUrl,
				downloadName: actionState.downloadName,
				label: input.label,
				publicUrl,
				title: actionState.title,
			});
			setQrPreviewError(null);
		} catch {
			setQrPreviewError("Nao foi possivel gerar o QR Code deste quarto.");
		}
	}

	async function downloadQrPreview() {
		if (!qrPreview) {
			return;
		}

		try {
			const link = document.createElement("a");
			link.href = qrPreview.dataUrl;
			link.download = qrPreview.downloadName;
			link.click();
		} catch {
			setQrPreviewError("Nao foi possivel baixar o QR Code agora.");
		}
	}

	return (
		<PageShell containerClassName="max-w-6xl gap-8" sidebar={<StaffNav />}>
			<SectionHeader
				badge="Administracao dos quartos"
				description="Cadastre quartos, mantenha os tokens atualizados e copie os links publicos usados pelo fluxo do hospede."
				title="Quartos e tokens de acesso"
			/>

			<StaffHotelGuard errorMessage={roomsQuery.error?.message} state={state}>
				<div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
					<Card className="border-primary/15 bg-card/88 shadow-primary/10 shadow-sm">
						<CardHeader>
							<CardTitle>Novo quarto</CardTitle>
							<CardDescription>
								Crie quartos com um token opaco pronto para ser usado no link
								publico do hospede.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="room-label">Identificacao</Label>
								<Input
									id="room-label"
									onChange={(event) => setNewLabel(event.target.value)}
									placeholder="Ex.: 305"
									value={newLabel}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="room-floor">Andar</Label>
								<Input
									id="room-floor"
									onChange={(event) => setNewFloor(event.target.value)}
									placeholder="Opcional"
									type="number"
									value={newFloor}
								/>
							</div>
							{formError ? (
								<p className="text-destructive text-sm">{formError}</p>
							) : null}
							<Button
								disabled={
									newLabel.trim().length === 0 || createRoomMutation.isPending
								}
								onClick={() =>
									createRoomMutation.mutate({
										floor: parseFloorValue(newFloor) ?? undefined,
										label: newLabel.trim(),
									})
								}
							>
								<PlusIcon className="size-4" />
								Criar quarto
							</Button>
						</CardContent>
					</Card>

					<Card className="border-primary/15 bg-card/88 shadow-primary/10 shadow-sm">
						<CardHeader>
							<CardTitle>Quartos cadastrados</CardTitle>
							<CardDescription>
								Edite o quarto, ative ou desative o acesso, gere o QR Code e
								regenere o token quando precisar trocar o link publico.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{actionError ? (
								<p className="text-destructive text-sm">{actionError}</p>
							) : null}
							{rooms.map((room) => {
								const draft = drafts[room.id] ?? {
									floor: room.floor?.toString() ?? "",
									label: room.label,
								};

								return (
									<div
										className="space-y-4 rounded-2xl border border-primary/10 bg-primary/[0.03] p-4"
										key={room.id}
									>
										<div className="flex flex-wrap items-start justify-between gap-3">
											<div className="space-y-1">
												<p className="flex items-center gap-2 font-medium">
													<PackageIcon className="size-4 text-primary" />
													Quarto {room.label}
												</p>
												<p className="text-muted-foreground text-sm">
													{formatFloorLabel(room.floor)}
												</p>
												<p className="text-muted-foreground text-xs">
													Status: {room.active ? "Ativo" : "Inativo"}
												</p>
											</div>
											<Button
												onClick={() =>
													updateRoomMutation.mutate({
														active: !room.active,
														roomId: room.id,
													})
												}
												size="sm"
												variant={room.active ? "secondary" : "outline"}
											>
												{room.active ? (
													<ToggleOffIcon className="size-4" />
												) : (
													<ToggleOnIcon className="size-4" />
												)}
												{room.active ? "Desativar" : "Ativar"}
											</Button>
										</div>

										<div className="grid gap-4 md:grid-cols-2">
											<div className="space-y-2">
												<Label htmlFor={`room-label-${room.id}`}>
													Identificacao
												</Label>
												<Input
													id={`room-label-${room.id}`}
													onChange={(event) =>
														setDrafts((currentDrafts) => ({
															...currentDrafts,
															[room.id]: {
																...draft,
																label: event.target.value,
															},
														}))
													}
													value={draft.label}
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor={`room-floor-${room.id}`}>Andar</Label>
												<Input
													id={`room-floor-${room.id}`}
													onChange={(event) =>
														setDrafts((currentDrafts) => ({
															...currentDrafts,
															[room.id]: {
																...draft,
																floor: event.target.value,
															},
														}))
													}
													placeholder="Opcional"
													type="number"
													value={draft.floor}
												/>
											</div>
										</div>

										<div className="space-y-2 rounded-2xl border border-primary/10 bg-background/80 p-3">
											<p className="font-medium text-sm">Token atual</p>
											<p className="break-all font-mono text-muted-foreground text-xs">
												{room.qrCodeToken}
											</p>
											<p className="break-all text-muted-foreground text-xs">
												{typeof window === "undefined"
													? `/g/${room.qrCodeToken}`
													: buildRoomPublicUrl(
															window.location.origin,
															room.qrCodeToken,
														)}
											</p>
										</div>

										<div className="flex flex-wrap gap-2">
											<Button
												onClick={() =>
													updateRoomMutation.mutate({
														floor: parseFloorValue(draft.floor),
														label: draft.label.trim(),
														roomId: room.id,
													})
												}
												size="sm"
											>
												<RefreshIcon className="size-4" />
												Salvar alteracoes
											</Button>
											<Button
												onClick={() =>
													regenerateTokenMutation.mutate({ roomId: room.id })
												}
												size="sm"
												variant="outline"
											>
												<RefreshIcon className="size-4" />
												Regenerar token
											</Button>
											<Button
												onClick={() => void copyRoomUrl(room.qrCodeToken)}
												size="sm"
												variant="outline"
											>
												Copiar link publico
											</Button>
											<Button
												onClick={() =>
													void openRoomQrPreview({
														label: room.label,
														qrCodeToken: room.qrCodeToken,
													})
												}
												size="sm"
												variant="outline"
											>
												Gerar QR Code
											</Button>
										</div>
									</div>
								);
							})}
							{rooms.length === 0 ? (
								<div className="rounded-2xl border border-primary/20 border-dashed bg-primary/[0.03] px-5 py-6 text-muted-foreground text-sm">
									Cadastre o primeiro quarto para gerar links de acesso do
									hospede.
								</div>
							) : null}
							{pagination ? (
								<PaginationControls pagination={pagination} />
							) : null}
						</CardContent>
					</Card>
				</div>
			</StaffHotelGuard>

			<AlertDialog
				onOpenChange={(open) => {
					if (!open) {
						setQrPreview(null);
						setQrPreviewError(null);
					}
				}}
				open={Boolean(qrPreview)}
			>
				<AlertDialogContent className="max-w-md rounded-[30px] border-white/70 bg-white p-0 sm:max-w-md">
					{qrPreview ? (
						<div className="space-y-0">
							<div className="border-border/60 border-b px-5 py-5">
								<AlertDialogHeader className="items-start text-left">
									<AlertDialogTitle>{qrPreview.title}</AlertDialogTitle>
									<AlertDialogDescription className="text-left">
										Use este QR Code para levar o hospede direto ao fluxo
										publico do quarto {qrPreview.label}.
									</AlertDialogDescription>
								</AlertDialogHeader>
							</div>
							<div className="space-y-4 p-5">
								<div className="rounded-[28px] border border-primary/10 bg-primary/[0.03] p-4">
									<Image
										alt={qrPreview.title}
										className="mx-auto aspect-square w-full max-w-[280px] rounded-[22px] bg-white object-contain p-3"
										height={280}
										src={qrPreview.dataUrl}
										width={280}
									/>
								</div>

								<div className="space-y-2 rounded-2xl border border-primary/10 bg-background/80 p-4">
									<p className="font-medium text-sm">Link publico</p>
									<p className="break-all text-muted-foreground text-xs">
										{qrPreview.publicUrl}
									</p>
								</div>

								{qrPreviewError ? (
									<p className="text-destructive text-sm">{qrPreviewError}</p>
								) : null}

								<div className="grid grid-cols-2 gap-3">
									<AlertDialogCancel className="rounded-full">
										Fechar
									</AlertDialogCancel>
									<AlertDialogAction
										className="rounded-full"
										onClick={() => void downloadQrPreview()}
									>
										Baixar QR Code
									</AlertDialogAction>
								</div>
							</div>
						</div>
					) : null}
				</AlertDialogContent>
			</AlertDialog>
		</PageShell>
	);
}
