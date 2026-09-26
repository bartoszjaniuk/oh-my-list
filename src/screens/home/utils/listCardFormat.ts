function polishUnits(
	n: number,
	one: string,
	few: string,
	many: string,
): string {
	if (n === 1) {
		return one;
	}
	const n100 = n % 100;
	if (n100 >= 12 && n100 <= 14) {
		return many;
	}
	const n10 = n % 10;
	if (n10 >= 2 && n10 <= 4) {
		return few;
	}
	return many;
}

/** „3 elementy”, „5 elementów” itd. */
export function formatItemsCountMessage(n: number): string {
	return polishUnits(n, "1 element", `${n} elementy`, `${n} elementów`);
}

/** „1 członek”, „2 członka” itd. */
export function formatMembersCountMessage(n: number): string {
	if (n === 1) {
		return "1 członek";
	}
	const n100 = n % 100;
	if (n100 >= 12 && n100 <= 14) {
		return `${n} członków`;
	}
	const n10 = n % 10;
	if (n10 >= 2 && n10 <= 4) {
		return `${n} członka`;
	}
	return `${n} członków`;
}

/** Prywatna when alone; Współdzielona when more than one member. */
export function formatSharingLabel(memberCount: number): string {
	return memberCount > 1 ? "Współdzielona" : "Prywatna";
}

export function formatListUpdatedAt(isoDate: string): string {
	const parsed = new Date(isoDate);
	if (Number.isNaN(parsed.getTime())) {
		return "Brak daty aktualizacji";
	}
	return `Aktualizacja: ${parsed.toLocaleDateString("pl-PL")}`;
}
