import { endpointBE } from "../layouts/utils/Constant";
import type { FlashSaleItemModel } from "../models/FlashSaleItemModel";
import type { FlashSaleModel } from "../models/FlashSaleModel";

type ApiEnvelope<T> = {
	success?: boolean;
	data?: T;
	message?: string;
};

function unwrapApiEnvelope<T>(body: ApiEnvelope<T> | T): T {
	if (body && typeof body === "object" && !Array.isArray(body) && "data" in body) {
		return (body as ApiEnvelope<T>).data as T;
	}

	return body as T;
}

function tryParseJson(text: string): any {
	if (!text) return null;
	try {
		return JSON.parse(text);
	} catch {
		return text;
	}
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
	const response = await fetch(url, init);
	const raw = await response.text();
	const body = tryParseJson(raw);

	if (!response.ok) {
		const message =
			typeof body === "string"
				? body
				: body?.message || body?.title || body?.error || `Request failed (${response.status})`;
		throw new Error(message);
	}

	return body as T;
}

function getAuthHeaders(): Record<string, string> {
	const token = localStorage.getItem("token");
	if (!token) {
		throw new Error("Bạn chưa đăng nhập");
	}

	return {
		Authorization: `Bearer ${token}`,
	};
}

export async function getActiveFlashSaleItems(): Promise<FlashSaleItemModel[]> {
	const endpoint = `${endpointBE}/flash-sale/active-items`;
	const body = await fetchJson<ApiEnvelope<FlashSaleItemModel[]> | FlashSaleItemModel[]>(endpoint);
	const data = unwrapApiEnvelope<FlashSaleItemModel[]>(body as any);
	return Array.isArray(data) ? data : [];
}

export async function getFlashSales(): Promise<FlashSaleModel[]> {
	const endpoint = `${endpointBE}/flash-sale`;
	const body = await fetchJson<ApiEnvelope<FlashSaleModel[]> | FlashSaleModel[]>(endpoint, {
		method: "GET",
		headers: {
			...getAuthHeaders(),
		},
	});
	const data = unwrapApiEnvelope<FlashSaleModel[]>(body as any);
	return Array.isArray(data) ? data : [];
}

export async function getFlashSaleItems(flashSaleId: number): Promise<FlashSaleItemModel[]> {
	const endpoint = `${endpointBE}/flash-sale/${flashSaleId}/items`;
	const body = await fetchJson<ApiEnvelope<FlashSaleItemModel[]> | FlashSaleItemModel[]>(endpoint, {
		method: "GET",
		headers: {
			...getAuthHeaders(),
		},
	});
	const data = unwrapApiEnvelope<FlashSaleItemModel[]>(body as any);
	return Array.isArray(data) ? data : [];
}

export type CreateFlashSalePayload = {
	name: string;
	startTime: string;
	endTime: string;
	image?: string;
};

export async function createFlashSale(payload: CreateFlashSalePayload): Promise<FlashSaleModel> {
	const endpoint = `${endpointBE}/flash-sale`;
	const body = await fetchJson<ApiEnvelope<FlashSaleModel> | FlashSaleModel>(endpoint, {
		method: "POST",
		headers: {
			...getAuthHeaders(),
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});
	return unwrapApiEnvelope<FlashSaleModel>(body as any) ?? ({} as FlashSaleModel);
}

export type AddFlashSaleItemPayload = {
	flashSaleId: number;
	bookId: number;
	originalPrice: number;
	salePrice: number;
	quantity: number;
	maxPerUser?: number | null;
};

export async function addFlashSaleItem(payload: AddFlashSaleItemPayload): Promise<FlashSaleItemModel> {
	const endpoint = `${endpointBE}/flash-sale/${payload.flashSaleId}/items`;
	const body = await fetchJson<ApiEnvelope<FlashSaleItemModel> | FlashSaleItemModel>(endpoint, {
		method: "POST",
		headers: {
			...getAuthHeaders(),
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});
	return unwrapApiEnvelope<FlashSaleItemModel>(body as any) ?? ({} as FlashSaleItemModel);
}

export type UpdateFlashSalePayload = {
	flashSaleId: number;
	name: string;
	startTime: string;
	endTime: string;
	status?: number;
	image?: string;
};

export async function updateFlashSale(payload: UpdateFlashSalePayload): Promise<FlashSaleModel> {
	const endpoint = `${endpointBE}/flash-sale/${payload.flashSaleId}`;
	const body = await fetchJson<ApiEnvelope<FlashSaleModel> | FlashSaleModel>(endpoint, {
		method: "PUT",
		headers: {
			...getAuthHeaders(),
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			name: payload.name,
			startTime: payload.startTime,
			endTime: payload.endTime,
			...(payload.image ? { image: payload.image } : {}),
			...(payload.status === undefined ? {} : { status: payload.status }),
		}),
	});
	return unwrapApiEnvelope<FlashSaleModel>(body as any) ?? ({} as FlashSaleModel);
}

export async function deleteFlashSale(flashSaleId: number): Promise<{ success?: boolean } | any> {
	const endpoint = `${endpointBE}/flash-sale/${flashSaleId}`;
	return fetchJson<ApiEnvelope<any>>(endpoint, {
		method: "DELETE",
		headers: {
			...getAuthHeaders(),
			"Content-Type": "application/json",
		},
	});
}

// export async function uploadFlashSaleImage(flashSaleId: number, imageFile: File): Promise<FlashSaleModel> {
// 	const endpoint = `${endpointBE}/flash-sale/${flashSaleId}/upload-image`;
// 	const formData = new FormData();
// 	// BE command thường có IFormFile Image (hoặc File). Dùng key "image" theo mô tả của bạn.
// 	formData.append("image", imageFile);

// 	const body = await fetchJson<ApiEnvelope<FlashSaleModel> | FlashSaleModel>(endpoint, {
// 		method: "POST",
// 		headers: {
// 			...getAuthHeaders(),
// 			// Không set Content-Type, browser sẽ tự set boundary cho multipart/form-data
// 		},
// 		body: formData,
// 	});

// 	return unwrapApiEnvelope<FlashSaleModel>(body as any) ?? ({} as FlashSaleModel);
// }
export async function uploadFlashSaleImage(flashSaleId: number, imageFile: File): Promise<FlashSaleModel> {
    const endpoint = `${endpointBE}/flash-sale/${flashSaleId}/upload-image`;
    const formData = new FormData();
    
    // 🔥 ĐỔI "image" THÀNH "file"
    formData.append("file", imageFile); 

    const body = await fetchJson<ApiEnvelope<FlashSaleModel> | FlashSaleModel>(endpoint, {
        method: "POST",
        headers: {
            ...getAuthHeaders(),
            // Không set Content-Type, browser sẽ tự set boundary cho multipart/form-data
        },
        body: formData,
    });

    return unwrapApiEnvelope<FlashSaleModel>(body as any) ?? ({} as FlashSaleModel);
}

export type UpdateFlashSaleItemPayload = {
	flashSaleId: number;
	itemId: number;
	originalPrice?: number;
	salePrice?: number;
	quantity?: number;
	maxPerUser?: number | null;
	rowVersion?: string;
};

export async function updateFlashSaleItem(payload: UpdateFlashSaleItemPayload): Promise<FlashSaleItemModel> {
	const endpoint = `${endpointBE}/flash-sale/${payload.flashSaleId}/items/${payload.itemId}`;
	const body = await fetchJson<ApiEnvelope<FlashSaleItemModel> | FlashSaleItemModel>(endpoint, {
		method: "PUT",
		headers: {
			...getAuthHeaders(),
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});
	return unwrapApiEnvelope<FlashSaleItemModel>(body as any) ?? ({} as FlashSaleItemModel);
}

export async function deleteFlashSaleItem(
	flashSaleId: number,
	itemId: number,
	rowVersion?: string
): Promise<{ success?: boolean } | any> {
	const endpoint = `${endpointBE}/flash-sale/${flashSaleId}/items/${itemId}`;
	return fetchJson<ApiEnvelope<any>>(endpoint, {
		method: "DELETE",
		headers: {
			...getAuthHeaders(),
			"Content-Type": "application/json",
		},
		body: rowVersion ? JSON.stringify({ rowVersion }) : undefined,
	});
}
