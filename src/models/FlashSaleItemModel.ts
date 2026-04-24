export interface FlashSaleItemModel {
	id?: number;
	flashSaleId?: number;
	bookId?: number;
	originalPrice?: number;
	salePrice?: number;
	quantity?: number;
	sold?: number;
	maxPerUser?: number | null;

	// Concurrency token (if API returns it as base64)
	rowVersion?: string;

	// optional fields if API includes denormalized book info
	bookName?: string;
	thumbnail?: string;
}
