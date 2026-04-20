import { buttonVariants } from "@nowait24/ui/button";
import { cn } from "@nowait24/ui/lib/utils";
import type { ReactNode } from "react";

export function FileUploadTrigger(props: {
	className?: string;
	children?: ReactNode;
	inputId: string;
	label: string;
	size?: "default" | "lg" | "sm" | "xs";
	variant?:
		| "default"
		| "destructive"
		| "ghost"
		| "link"
		| "outline"
		| "secondary";
}) {
	return (
		<label
			className={cn(
				buttonVariants({
					className: props.className,
					size: props.size ?? "default",
					variant: props.variant ?? "default",
				}),
				"cursor-pointer",
			)}
			htmlFor={props.inputId}
		>
			{props.children}
			<span>{props.label}</span>
		</label>
	);
}
