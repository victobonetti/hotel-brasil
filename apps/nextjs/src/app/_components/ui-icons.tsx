interface IconProps {
	className?: string;
}

function Svg(props: React.ComponentProps<"svg">) {
	return (
		<svg
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="1.8"
			viewBox="0 0 24 24"
			{...props}
		/>
	);
}

export function ArrowDownIcon({ className }: IconProps) {
	return (
		<Svg className={className}>
			<path d="M12 5v14" />
			<path d="m6 13 6 6 6-6" />
		</Svg>
	);
}

export function ArrowUpIcon({ className }: IconProps) {
	return (
		<Svg className={className}>
			<path d="M12 19V5" />
			<path d="m18 11-6-6-6 6" />
		</Svg>
	);
}

export function ClockIcon({ className }: IconProps) {
	return (
		<Svg className={className}>
			<circle cx="12" cy="12" r="8.5" />
			<path d="M12 8v4.5l3 2" />
		</Svg>
	);
}

export function ImageIcon({ className }: IconProps) {
	return (
		<Svg className={className}>
			<rect height="14" rx="2" width="16" x="4" y="5" />
			<circle cx="9" cy="10" r="1.5" />
			<path d="m20 15-4.5-4.5L8 18" />
		</Svg>
	);
}

export function FolderIcon({ className }: IconProps) {
	return (
		<Svg className={className}>
			<path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h4l2 2h6A2.5 2.5 0 0 1 20.5 9.5v7A2.5 2.5 0 0 1 18 19H6a2.5 2.5 0 0 1-2.5-2.5z" />
		</Svg>
	);
}

export function GridIcon({ className }: IconProps) {
	return (
		<Svg className={className}>
			<rect height="6" rx="1.2" width="6" x="4" y="4" />
			<rect height="6" rx="1.2" width="6" x="14" y="4" />
			<rect height="6" rx="1.2" width="6" x="4" y="14" />
			<rect height="6" rx="1.2" width="6" x="14" y="14" />
		</Svg>
	);
}

export function LogoutIcon({ className }: IconProps) {
	return (
		<Svg className={className}>
			<path d="M9 20H6.5A2.5 2.5 0 0 1 4 17.5v-11A2.5 2.5 0 0 1 6.5 4H9" />
			<path d="M14 8l4 4-4 4" />
			<path d="M18 12H9" />
		</Svg>
	);
}

export function PackageIcon({ className }: IconProps) {
	return (
		<Svg className={className}>
			<path d="m12 3 7 4v10l-7 4-7-4V7z" />
			<path d="m12 3 7 4-7 4-7-4" />
			<path d="M12 11v10" />
		</Svg>
	);
}

export function PlusIcon({ className }: IconProps) {
	return (
		<Svg className={className}>
			<path d="M12 5v14" />
			<path d="M5 12h14" />
		</Svg>
	);
}

export function RefreshIcon({ className }: IconProps) {
	return (
		<Svg className={className}>
			<path d="M20 11a8 8 0 1 0 2 5.5" />
			<path d="M20 4v7h-7" />
		</Svg>
	);
}

export function TrashIcon({ className }: IconProps) {
	return (
		<Svg className={className}>
			<path d="M4 7h16" />
			<path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
			<path d="M7.5 7 8.2 19a1.5 1.5 0 0 0 1.5 1.4h4.6a1.5 1.5 0 0 0 1.5-1.4L16.5 7" />
			<path d="M10 10.5v6" />
			<path d="M14 10.5v6" />
		</Svg>
	);
}

export function ShieldIcon({ className }: IconProps) {
	return (
		<Svg className={className}>
			<path d="M12 3 6 5.5v5.8c0 4.2 2.7 8 6 9.7 3.3-1.7 6-5.5 6-9.7V5.5z" />
			<path d="m9.5 12 1.8 1.8 3.7-4" />
		</Svg>
	);
}

export function TagIcon({ className }: IconProps) {
	return (
		<Svg className={className}>
			<path d="m20 12-8 8-7-7V5h8z" />
			<circle cx="9" cy="9" r="1" />
		</Svg>
	);
}

export function ToggleOffIcon({ className }: IconProps) {
	return (
		<Svg className={className}>
			<rect height="10" rx="5" width="18" x="3" y="7" />
			<circle cx="8" cy="12" r="3" />
		</Svg>
	);
}

export function ToggleOnIcon({ className }: IconProps) {
	return (
		<Svg className={className}>
			<rect height="10" rx="5" width="18" x="3" y="7" />
			<circle cx="16" cy="12" r="3" />
		</Svg>
	);
}

export function UtensilsIcon({ className }: IconProps) {
	return (
		<Svg className={className}>
			<path d="M6 4v8" />
			<path d="M9 4v8" />
			<path d="M6 8h3" />
			<path d="M7.5 12v8" />
			<path d="M16 4c1.7 2 1.7 5 0 7v9" />
			<path d="M13 4v4c0 1.7 1.3 3 3 3" />
		</Svg>
	);
}
