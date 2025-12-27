import { cn } from "@finchat/ui/lib/utils";
import { Toaster } from "@finchat/ui/sonner";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";

import { TRPCReactProvider } from "~/trpc/react";

import "~/app/globals.css";

export const metadata: Metadata = {
	description: "Sua plataforma de finanças",
	title: "FinChat",
};

export const viewport: Viewport = {
	themeColor: [
		{ color: "white", media: "(prefers-color-scheme: light)" },
		{ color: "black", media: "(prefers-color-scheme: dark)" },
	],
};

const geistSans = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
});
const geistMono = Geist_Mono({
	subsets: ["latin"],
	variable: "--font-geist-mono",
});

export default function RootLayout(props: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={cn(
					"min-h-screen bg-background font-sans text-foreground antialiased",
					geistSans.variable,
					geistMono.variable,
				)}
			>
				<ThemeProvider>
					<TRPCReactProvider>{props.children}</TRPCReactProvider>
					<Toaster />
				</ThemeProvider>
			</body>
		</html>
	);
}
