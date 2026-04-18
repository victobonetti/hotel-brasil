"use client";

import { Button } from "@nowait24/ui/button";
import { startTransition, useState } from "react";

import { authClient } from "~/auth/client";

export function GoogleSignInButton(props?: {
	className?: string;
	label?: string;
	size?: "default" | "lg" | "sm";
}) {
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isPending, setIsPending] = useState(false);

	const handleSignIn = () => {
		setErrorMessage(null);
		setIsPending(true);

		startTransition(async () => {
			try {
				await authClient.signIn.social({
					callbackURL: "/",
					provider: "google",
				});
			} catch (error) {
				setErrorMessage(
					error instanceof Error
						? error.message
						: "Nao foi possivel iniciar o login com Google.",
				);
				setIsPending(false);
			}
		});
	};

	return (
		<div className="space-y-3">
			<Button
				className={props?.className ?? "w-full"}
				disabled={isPending}
				onClick={handleSignIn}
				size={props?.size ?? "lg"}
				type="button"
			>
				{isPending
					? "Redirecionando..."
					: (props?.label ?? "Entrar com Google")}
			</Button>
			{errorMessage ? (
				<p className="text-destructive text-sm">{errorMessage}</p>
			) : null}
		</div>
	);
}
