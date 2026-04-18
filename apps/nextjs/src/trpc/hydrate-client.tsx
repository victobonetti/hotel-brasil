"use client";

import { HydrationBoundary as RQHydrationBoundary, type HydrationBoundaryProps } from "@tanstack/react-query";

export function HydrationBoundary(props: HydrationBoundaryProps) {
	return <RQHydrationBoundary {...props} />;
}
