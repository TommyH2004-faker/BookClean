import type { FlashSaleItemModel } from "./FlashSaleItemModel";


export enum FlashSaleStatus {
    Draft = 0,
    Active = 1,
    Ended = 2,
    Cancelled = 3,
}

export function flashSaleStatusLabel(status?: FlashSaleStatus | number | null): string {
	if (status === undefined || status === null) return "";

	switch (status) {
		case FlashSaleStatus.Draft:
			return "Đang chờ xử lý ";
		case FlashSaleStatus.Active:
			return "Đang hoạt động";
		case FlashSaleStatus.Cancelled:
			return "Đã huỷ";
		case FlashSaleStatus.Ended:
			return "Đã kết thúc";
		default:
			return String(status);
	}
}

export interface FlashSaleModel {
	id?: number;
	name?: string;
	image?: string;
	startTime?: string;
	endTime?: string;
	status?: FlashSaleStatus;
	items?: FlashSaleItemModel[];
}
