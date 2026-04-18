"use client";

import { Button } from "@nowait24/ui/button";
import { useMutation } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/react";

type OrderStatus =
	| "accepted"
	| "cancelled"
	| "delivered"
	| "out_for_delivery"
	| "pending"
	| "preparing";

export function OrderActionButtons(props: {
	onSuccess?: () => void;
	orderId: string;
	status: OrderStatus;
}) {
	const trpc = useTRPC();
	const acceptMutation = useMutation(
		trpc.staffOrder.acceptOrder.mutationOptions({
			onSuccess: () => {
				props.onSuccess?.();
			},
		}),
	);
	const preparingMutation = useMutation(
		trpc.staffOrder.markOrderPreparing.mutationOptions({
			onSuccess: () => {
				props.onSuccess?.();
			},
		}),
	);
	const outForDeliveryMutation = useMutation(
		trpc.staffOrder.markOrderOutForDelivery.mutationOptions({
			onSuccess: () => {
				props.onSuccess?.();
			},
		}),
	);
	const deliveredMutation = useMutation(
		trpc.staffOrder.markOrderDelivered.mutationOptions({
			onSuccess: () => {
				props.onSuccess?.();
			},
		}),
	);
	const cancelMutation = useMutation(
		trpc.staffOrder.cancelOrder.mutationOptions({
			onSuccess: () => {
				props.onSuccess?.();
			},
		}),
	);

	const isBusy =
		acceptMutation.isPending ||
		preparingMutation.isPending ||
		outForDeliveryMutation.isPending ||
		deliveredMutation.isPending ||
		cancelMutation.isPending;

	return (
		<div className="space-y-3">
			<p className="font-medium text-primary text-sm">Acoes operacionais</p>
			<div className="flex flex-wrap gap-2">
				{props.status === "pending" ? (
					<Button
						disabled={isBusy}
						onClick={() => acceptMutation.mutate({ orderId: props.orderId })}
					>
						Aceitar
					</Button>
				) : null}
				{props.status === "accepted" ? (
					<Button
						disabled={isBusy}
						onClick={() => preparingMutation.mutate({ orderId: props.orderId })}
						variant="secondary"
					>
						Marcar preparo
					</Button>
				) : null}
				{props.status === "preparing" ? (
					<Button
						disabled={isBusy}
						onClick={() =>
							outForDeliveryMutation.mutate({ orderId: props.orderId })
						}
						variant="secondary"
					>
						Sair para entrega
					</Button>
				) : null}
				{props.status === "out_for_delivery" ? (
					<Button
						disabled={isBusy}
						onClick={() => deliveredMutation.mutate({ orderId: props.orderId })}
					>
						Marcar entregue
					</Button>
				) : null}
				{props.status !== "cancelled" && props.status !== "delivered" ? (
					<Button
						disabled={isBusy}
						onClick={() => cancelMutation.mutate({ orderId: props.orderId })}
						variant="destructive"
					>
						Cancelar
					</Button>
				) : null}
			</div>
		</div>
	);
}
