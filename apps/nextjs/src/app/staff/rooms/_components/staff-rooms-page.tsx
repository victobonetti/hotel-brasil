"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
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
	BedIcon,
	BuildingIcon,
	CopyIcon,
	LinkIcon,
	PlusIcon,
	QrCodeIcon,
	RefreshIcon,
	SaveIcon,
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
	const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
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
				setSelectedRoomId(null);
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
	const selectedRoom =
		selectedRoomId === null
			? null
			: (rooms.find((room) => room.id === selectedRoomId) ?? null);
	const selectedRoomDraft =
		selectedRoom === null
			? null
			: (drafts[selectedRoom.id] ?? {
					floor: selectedRoom.floor?.toString() ?? "",
					label: selectedRoom.label,
				});

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
		<PageShell containerClassName="max-w-6xl gap-6" sidebar={<StaffNav />}>
			<SectionHeader
				badge="Quartos"
				description="Acesso dos quartos."
				supportingPanel={
					<div className="flex items-center gap-2 text-muted-foreground text-sm">
						<BedIcon className="size-4" />
						<span>{pagination?.totalItems ?? 0} ativos no painel</span>
					</div>
				}
				title="Quartos"
			/>

			<StaffHotelGuard errorMessage={roomsQuery.error?.message} state={state}>
				<div className="grid gap-3 md:grid-cols-3">
					<div className="rounded-[1.4rem] border border-border/70 bg-card/90 p-5 shadow-sm">
						<div className="flex items-center gap-2 text-muted-foreground text-sm">
							<BedIcon className="size-4" />
							<span>Quartos</span>
						</div>
						<p className="mt-3 font-semibold text-3xl">
							{pagination?.totalItems ?? 0}
						</p>
					</div>
					<div className="rounded-[1.4rem] border border-border/70 bg-card/90 p-5 shadow-sm">
						<div className="flex items-center gap-2 text-muted-foreground text-sm">
							<ToggleOnIcon className="size-4" />
							<span>Ativos</span>
						</div>
						<p className="mt-3 font-semibold text-3xl">
							{rooms.filter((room) => room.active).length}
						</p>
					</div>
					<div className="rounded-[1.4rem] border border-border/70 bg-card/90 p-5 shadow-sm">
						<div className="flex items-center gap-2 text-muted-foreground text-sm">
							<BuildingIcon className="size-4" />
							<span>Sem andar</span>
						</div>
						<p className="mt-3 font-semibold text-3xl">
							{rooms.filter((room) => room.floor === null).length}
						</p>
					</div>
				</div>

				<div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
					<Card className="border-border/70 bg-card/90 shadow-sm lg:sticky lg:top-6 lg:h-fit">
						<CardHeader>
							<CardTitle>Criar</CardTitle>
							<CardDescription>Link e QR prontos na hora.</CardDescription>
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
								className="w-full"
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
								Salvar quarto
							</Button>
						</CardContent>
					</Card>

					<Card className="border-border/70 bg-card/90 shadow-sm">
						<CardHeader>
							<CardTitle>Painel</CardTitle>
							<CardDescription>
								Status, link e QR em um fluxo so.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{actionError ? (
								<p className="text-destructive text-sm">{actionError}</p>
							) : null}
							{rooms.map((room) => (
								<div
									className="rounded-[1.6rem] border border-border/70 bg-background/80 p-4 md:p-5"
									key={room.id}
								>
									<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
										<div className="flex items-center gap-3">
											<div className="flex size-10 items-center justify-center rounded-2xl bg-primary/[0.08] text-primary">
												<BedIcon className="size-4" />
											</div>
											<div className="space-y-1">
												<p className="font-semibold text-lg leading-none">
													Quarto {room.label}
												</p>
												<div className="flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
													<div
														className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1"
														title={formatFloorLabel(room.floor)}
													>
														<BuildingIcon className="size-3.5" />
														<span>{room.floor ?? "-"}</span>
													</div>
													<div
														className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ring-1 ring-inset"
														title={
															room.active ? "Acesso ativo" : "Acesso inativo"
														}
													>
														{room.active ? (
															<>
																<ToggleOnIcon className="size-3.5 text-primary" />
																<span>Ativo</span>
															</>
														) : (
															<>
																<ToggleOffIcon className="size-3.5" />
																<span>Pausado</span>
															</>
														)}
													</div>
												</div>
											</div>
										</div>

										<div className="flex items-center gap-2 self-start">
											<Button
												onClick={() => setSelectedRoomId(room.id)}
												size="sm"
												variant="outline"
											>
												Detalhes
											</Button>
											<Button
												aria-label={
													room.active ? "Desativar quarto" : "Ativar quarto"
												}
												onClick={() =>
													updateRoomMutation.mutate({
														active: !room.active,
														roomId: room.id,
													})
												}
												size="icon-sm"
												title={room.active ? "Desativar" : "Ativar"}
												variant={room.active ? "secondary" : "outline"}
											>
												{room.active ? (
													<ToggleOffIcon className="size-4" />
												) : (
													<ToggleOnIcon className="size-4" />
												)}
											</Button>
										</div>
									</div>
								</div>
							))}
							{rooms.length === 0 ? (
								<div className="rounded-[1.25rem] border border-border/70 border-dashed bg-background/60 px-5 py-6 text-muted-foreground text-sm">
									Nenhum quarto ainda.
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
						setSelectedRoomId(null);
						setActionError(null);
					}
				}}
				open={selectedRoom !== null}
			>
				<AlertDialogContent className="max-w-xl rounded-[30px] border-white/70 bg-white p-0 sm:max-w-xl">
					{selectedRoom && selectedRoomDraft ? (
						<div className="space-y-0">
							<div className="border-border/60 border-b px-5 py-5">
								<AlertDialogHeader className="items-start text-left">
									<AlertDialogTitle>
										Quarto {selectedRoom.label}
									</AlertDialogTitle>
									<AlertDialogDescription className="text-left">
										Edite os dados e gerencie o acesso deste quarto.
									</AlertDialogDescription>
								</AlertDialogHeader>
							</div>
							<div className="space-y-5 p-5">
								<div className="flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
									<div
										className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1"
										title={formatFloorLabel(selectedRoom.floor)}
									>
										<BuildingIcon className="size-3.5" />
										<span>{selectedRoom.floor ?? "-"}</span>
									</div>
									<div
										className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ring-1 ring-inset"
										title={
											selectedRoom.active ? "Acesso ativo" : "Acesso inativo"
										}
									>
										{selectedRoom.active ? (
											<>
												<ToggleOnIcon className="size-3.5 text-primary" />
												<span>Ativo</span>
											</>
										) : (
											<>
												<ToggleOffIcon className="size-3.5" />
												<span>Pausado</span>
											</>
										)}
									</div>
								</div>

								<div className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]">
									<div className="space-y-2">
										<Label htmlFor={`room-label-${selectedRoom.id}`}>
											Quarto
										</Label>
										<Input
											id={`room-label-${selectedRoom.id}`}
											onChange={(event) =>
												setDrafts((currentDrafts) => ({
													...currentDrafts,
													[selectedRoom.id]: {
														...selectedRoomDraft,
														label: event.target.value,
													},
												}))
											}
											value={selectedRoomDraft.label}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor={`room-floor-${selectedRoom.id}`}>
											Andar
										</Label>
										<Input
											id={`room-floor-${selectedRoom.id}`}
											onChange={(event) =>
												setDrafts((currentDrafts) => ({
													...currentDrafts,
													[selectedRoom.id]: {
														...selectedRoomDraft,
														floor: event.target.value,
													},
												}))
											}
											placeholder="Opcional"
											type="number"
											value={selectedRoomDraft.floor}
										/>
									</div>
								</div>

								<div className="rounded-[1.2rem] border border-border/70 bg-card px-4 py-3">
									<div className="flex items-center gap-2">
										<div className="flex size-9 items-center justify-center rounded-xl bg-muted text-muted-foreground">
											<LinkIcon className="size-4" />
										</div>
										<div className="min-w-0 flex-1">
											<p className="text-[11px] text-muted-foreground uppercase tracking-[0.2em]">
												Acesso
											</p>
											<p className="truncate text-sm">
												{typeof window === "undefined"
													? `/g/${selectedRoom.qrCodeToken}`
													: buildRoomPublicUrl(
															window.location.origin,
															selectedRoom.qrCodeToken,
														)}
											</p>
										</div>
									</div>
								</div>

								{actionError ? (
									<p className="text-destructive text-sm">{actionError}</p>
								) : null}

								<div className="grid gap-2 sm:grid-cols-2">
									<Button
										onClick={() =>
											regenerateTokenMutation.mutate({
												roomId: selectedRoom.id,
											})
										}
										variant="outline"
									>
										<RefreshIcon className="size-4" />
										Regenerar token
									</Button>
									<Button
										onClick={() => void copyRoomUrl(selectedRoom.qrCodeToken)}
										variant="outline"
									>
										<CopyIcon className="size-4" />
										Copiar link
									</Button>
									<Button
										onClick={() =>
											updateRoomMutation.mutate({
												active: !selectedRoom.active,
												roomId: selectedRoom.id,
											})
										}
										variant="outline"
									>
										{selectedRoom.active ? (
											<ToggleOffIcon className="size-4" />
										) : (
											<ToggleOnIcon className="size-4" />
										)}
										{selectedRoom.active ? "Desativar acesso" : "Ativar acesso"}
									</Button>
									<Button
										onClick={() =>
											void openRoomQrPreview({
												label: selectedRoom.label,
												qrCodeToken: selectedRoom.qrCodeToken,
											})
										}
										variant="outline"
									>
										<QrCodeIcon className="size-4" />
										Abrir QR
									</Button>
								</div>

								<AlertDialogFooter className="pt-2">
									<AlertDialogCancel className="rounded-full">
										Fechar
									</AlertDialogCancel>
									<AlertDialogAction
										className="rounded-full"
										onClick={() =>
											updateRoomMutation.mutate({
												floor: parseFloorValue(selectedRoomDraft.floor),
												label: selectedRoomDraft.label.trim(),
												roomId: selectedRoom.id,
											})
										}
									>
										<SaveIcon className="size-4" />
										Salvar
									</AlertDialogAction>
								</AlertDialogFooter>
							</div>
						</div>
					) : null}
				</AlertDialogContent>
			</AlertDialog>

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
