import { describe, expect, test } from "bun:test";

import { getStaffNavItems, isStaffNavItemActive } from "./staff-nav";

describe("getStaffNavItems", () => {
	test("lists the main staff destinations", () => {
		expect(getStaffNavItems()).toEqual([
			{
				description: "Acompanhe a fila e avance cada pedido com clareza.",
				href: "/staff/orders",
				label: "Pedidos",
			},
			{
				description: "Organize categorias e itens sem perder o contexto.",
				href: "/staff/menu",
				label: "Cardapio",
			},
			{
				description: "Mantenha quartos e acessos publicos prontos para uso.",
				href: "/staff/rooms",
				label: "Quartos",
			},
		]);
	});
});

describe("isStaffNavItemActive", () => {
	test("marks menu routes as active for nested menu pages", () => {
		expect(isStaffNavItemActive("/staff/menu", "/staff/menu")).toBe(true);
		expect(isStaffNavItemActive("/staff/menu/items", "/staff/menu")).toBe(true);
		expect(isStaffNavItemActive("/staff/orders", "/staff/menu")).toBe(false);
	});

	test("marks rooms route as active only for the rooms page", () => {
		expect(isStaffNavItemActive("/staff/rooms", "/staff/rooms")).toBe(true);
		expect(isStaffNavItemActive("/staff/orders", "/staff/rooms")).toBe(false);
	});
});
