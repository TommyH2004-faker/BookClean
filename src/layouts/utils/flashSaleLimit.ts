import type { FlashSaleItemModel } from "../../models/FlashSaleItemModel";
import { getActiveFlashSaleItemByBookId } from "../../api/FlashSaleApi";
import { getMyOrders } from "../../api/OrderApi";

const CACHE_TTL_MS = 30_000;
const PURCHASE_CACHE_TTL_MS = 30_000;
const FLASH_SALE_PURCHASE_CACHE_CHANGED_EVENT = "flashsale-purchase-cache-changed";

const COUNTED_ORDER_STATUSES = new Set(["Đang xử lý", "Đang giao hàng", "Thành công"]);

type CacheEntry = {
	value: FlashSaleItemModel | null;
	cachedAt: number;
};

type PurchaseUsageCacheEntry = {
	counts: Record<number, number>;
	cachedAt: number;
};

const cache = new Map<number, CacheEntry>();
const inFlight = new Map<number, Promise<FlashSaleItemModel | null>>();
let purchaseUsageCache: PurchaseUsageCacheEntry | null = null;
let purchaseUsageInFlight: Promise<Record<number, number>> | null = null;

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

// export async function getFlashSaleMaxPerUser(bookId: number): Promise<number | null> {
// 	const item = await getActiveFlashSaleItemForBook(bookId);
// 	const max = item?.maxPerUser;
// 	if (typeof max === "number" && Number.isFinite(max) && max > 0) return max;
// 	return null;
// }

async function loadPurchasedFlashSaleCounts(): Promise<Record<number, number>> {
	const now = Date.now();
	if (purchaseUsageCache && now - purchaseUsageCache.cachedAt < PURCHASE_CACHE_TTL_MS) {
		return purchaseUsageCache.counts;
	}

	if (purchaseUsageInFlight) {
		return purchaseUsageInFlight;
	}

	purchaseUsageInFlight = getMyOrders()
		.then((orders) => {
			const counts: Record<number, number> = {};

			for (const order of orders ?? []) {
				if (!COUNTED_ORDER_STATUSES.has(String(order?.status ?? ""))) continue;

				for (const cartItem of order?.cartItems ?? []) {
					const bookId = Number(cartItem?.book?.idBook ?? 0);
					const quantity = Number(cartItem?.quantity ?? 0);
					if (!Number.isFinite(bookId) || bookId <= 0 || !Number.isFinite(quantity) || quantity <= 0) continue;
					counts[bookId] = (counts[bookId] ?? 0) + quantity;
				}
			}

			purchaseUsageCache = { counts, cachedAt: Date.now() };
			return counts;
		})
		.catch(() => {
			purchaseUsageCache = { counts: {}, cachedAt: Date.now() };
			return {};
		})
		.finally(() => {
			purchaseUsageInFlight = null;
		});

	return purchaseUsageInFlight;
}

export async function getPurchasedFlashSaleQuantityForBook(bookId: number): Promise<number> {
	const id = Number(bookId);
	if (!Number.isFinite(id) || id <= 0) return 0;

	const counts = await loadPurchasedFlashSaleCounts();
	return Number(counts[id] ?? 0);
}

export function clearFlashSalePurchaseUsageCache(): void {
	purchaseUsageCache = null;
	purchaseUsageInFlight = null;
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent(FLASH_SALE_PURCHASE_CACHE_CHANGED_EVENT));
	}
}

export const FLASH_SALE_PURCHASE_CACHE_EVENT = FLASH_SALE_PURCHASE_CACHE_CHANGED_EVENT;
