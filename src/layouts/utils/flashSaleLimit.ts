import type { FlashSaleItemModel } from "../../models/FlashSaleItemModel";
import { getActiveFlashSaleItemByBookId } from "../../api/FlashSaleApi";

const CACHE_TTL_MS = 30_000;

type CacheEntry = {
	value: FlashSaleItemModel | null;
	cachedAt: number;
};

const cache = new Map<number, CacheEntry>();
const inFlight = new Map<number, Promise<FlashSaleItemModel | null>>();

export async function getActiveFlashSaleItemForBook(bookId: number): Promise<FlashSaleItemModel | null> {
	const id = Number(bookId);
	if (!Number.isFinite(id) || id <= 0) return null;

	const now = Date.now();
	const existing = cache.get(id);
	if (existing && now - existing.cachedAt < CACHE_TTL_MS) {
		return existing.value;
	}

	const inflight = inFlight.get(id);
	if (inflight) return inflight;

	const promise = getActiveFlashSaleItemByBookId(id)
		.then((value) => {
			cache.set(id, { value, cachedAt: Date.now() });
			return value;
		})
		.finally(() => {
			inFlight.delete(id);
		});

	inFlight.set(id, promise);
	return promise;
}

export async function getFlashSaleMaxPerUser(bookId: number): Promise<number | null> {
	const item = await getActiveFlashSaleItemForBook(bookId);
	const max = item?.maxPerUser;
	if (typeof max === "number" && Number.isFinite(max) && max > 0) return max;
	return null;
}
