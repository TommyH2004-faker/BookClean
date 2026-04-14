export const FLASH_SALE_SLOT_HOURS = [0, 12, 18, 21] as const;
export type FlashSaleSlotHour = (typeof FLASH_SALE_SLOT_HOURS)[number];

export function formatSlotLabel(hour: number): string {
	return `${hour.toString().padStart(2, "0")}:00`;
}

export function getActiveFlashSaleSlotHour(now: Date = new Date()): FlashSaleSlotHour {
	const currentHour = now.getHours();
	// pick the latest slot hour that is <= current hour
	for (let i = FLASH_SALE_SLOT_HOURS.length - 1; i >= 0; i--) {
		const slotHour = FLASH_SALE_SLOT_HOURS[i];
		if (currentHour >= slotHour) return slotHour;
	}
	// before 00:00 cannot happen, but keep a safe fallback
	return 0;
}

export function parseFlashSaleSlotParam(slotParam: string | null | undefined, now: Date = new Date()): FlashSaleSlotHour {
	if (!slotParam) return getActiveFlashSaleSlotHour(now);

	const raw = slotParam.trim();
	const asNumber = Number(raw);
	if (!Number.isFinite(asNumber)) return getActiveFlashSaleSlotHour(now);

	// accept hour values directly
	if ((FLASH_SALE_SLOT_HOURS as readonly number[]).includes(asNumber)) {
		return asNumber as FlashSaleSlotHour;
	}

	// also accept index 0..3
	if (Number.isInteger(asNumber) && asNumber >= 0 && asNumber < FLASH_SALE_SLOT_HOURS.length) {
		return FLASH_SALE_SLOT_HOURS[asNumber];
	}

	return getActiveFlashSaleSlotHour(now);
}

export function getFlashSaleSlotIndex(slotHour: FlashSaleSlotHour): number {
	return FLASH_SALE_SLOT_HOURS.indexOf(slotHour);
}

export function getNextFlashSaleSlotHour(slotHour: FlashSaleSlotHour): FlashSaleSlotHour {
	const idx = getFlashSaleSlotIndex(slotHour);
	const nextIdx = (idx + 1) % FLASH_SALE_SLOT_HOURS.length;
	return FLASH_SALE_SLOT_HOURS[nextIdx];
}
