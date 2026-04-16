"use client";

import { Button } from "@finchat/ui/button";
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
			onSuccess: (data) => {
				void data;
				props.onSuccess?.();
			},
		}),
	);
	const preparingMutation = useMutation(
		trpc.staffOrder.markOrderPreparing.mutationOptions({
			onSuccess: (data) => {
				void data;
				props.onSuccess?.();
			},
		}),
	);
	const outForDeliveryMutation = useMutation(
		trpc.staffOrder.markOrderOutForDelivery.mutationOptions({
			onSuccess: (data) => {
				void data;
				props.onSuccess?.();
			},
		}),
	);
	const deliveredMutation = useMutation(
		trpc.staffOrder.markOrderDelivered.mutationOptions({
			onSuccess: (data) => {
				void data;
				props.onSuccess?.();
			},
		}),
	);
	const cancelMutation = useMutation(
		trpc.staffOrder.cancelOrder.mutationOptions({
			onSuccess: (data) => {
				void data;
				props.onSuccess?.();
			},
		}),
	);

	return (
		<div className="flex flex-wrap gap-2">
			{props.status === "pending" ? (
				<Button onClick={() => acceptMutation.mutate({ orderId: props.orderId })}>
					Aceitar
				</Button>
			) : null}
			{props.status === "accepted" ? (
				<Button
					onClick={() => preparingMutation.mutate({ orderId: props.orderId })}
					variant="secondary"
				>
					Marcar preparo
				</Button>
			) : null}
			{props.status === "preparing" ? (
				<Button
					onClick={() => outForDeliveryMutation.mutate({ orderId: props.orderId })}
					variant="secondary"
				>
					Sair para entrega
				</Button>
			) : null}
			{props.status === "out_for_delivery" ? (
				<Button
					onClick={() => deliveredMutation.mutate({ orderId: props.orderId })}
					variant="default"
				>
					Marcar entregue
				</Button>
			) : null}
			{props.status !== "cancelled" && props.status !== "delivered" ? (
				<Button
					onClick={() => cancelMutation.mutate({ orderId: props.orderId })}
					variant="destructive"
				>
					Cancelar
				</Button>
			) : null}
		</div>
	);
}
