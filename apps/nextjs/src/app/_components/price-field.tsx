"use client";

import { Input } from "@finchat/ui/input";

export function parsePriceInputToCents(value: string) {
	const digits = value.replace(/\D/g, "");

	return digits.length === 0 ? 0 : Number(digits);
}

export function formatPriceInput(value: string) {
	const digits = value.replace(/\D/g, "");
	const cents = digits.length === 0 ? 0 : Number(digits);

	return new Intl.NumberFormat("pt-BR", {
		currency: "BRL",
		style: "currency",
	})
		.format(cents / 100)
		.replace(/^R\$\s?/, "");
}

export function formatPriceLabel(priceInCents: number) {
	return new Intl.NumberFormat("pt-BR", {
		currency: "BRL",
		style: "currency",
	}).format(priceInCents / 100);
}

export function PriceField(props: {
	id: string;
	onChange: (priceInCents: number) => void;
	valueInCents: number;
}) {
	return (
		<Input
			id={props.id}
			inputMode="numeric"
			onChange={(event) => {
				props.onChange(parsePriceInputToCents(event.target.value));
			}}
			placeholder="0,00"
			value={formatPriceInput(String(props.valueInCents))}
		/>
	);
}
