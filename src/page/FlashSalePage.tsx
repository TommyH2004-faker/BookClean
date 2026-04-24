import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import useScrollToTop from "../hooks/ScrollToTop";
import { getFlashSaleItems, getFlashSales } from "../api/FlashSaleApi";
import { layThumbnailSachTheoTenSach } from "../api/HinhAnhAPI";
import type { FlashSaleItemModel } from "../models/FlashSaleItemModel";
import type { FlashSaleModel } from "../models/FlashSaleModel";
import { PhanTrang } from "../layouts/utils/PhanTrang";

const PAGE_SIZE = 16;

function calcDiscountPercent(originalPrice: number, salePrice: number): number {
	if (originalPrice > 0 && salePrice > 0 && salePrice < originalPrice) {
		return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
	}
	return 0;
}

function getRemainingPercent(item: FlashSaleItemModel): number {
	const quantity = Number(item.quantity ?? 0);
	const sold = Number(item.sold ?? 0);
	const total = quantity + sold;
	return total > 0 ? Math.round((sold / total) * 100) : 0;
}

const FlashSalePage: React.FC = () => {
	useScrollToTop();
	const [searchParams] = useSearchParams();
	const [selectedSale, setSelectedSale] = useState<FlashSaleModel | null>(null);
	const [items, setItems] = useState<FlashSaleItemModel[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [erroring, setErroring] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState<number>(1);

	const selectedSaleId = useMemo(() => {
		const raw = searchParams.get("saleId") ?? searchParams.get("flashSaleId");
		const parsed = Number(raw);
		return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
	}, [searchParams]);

	useEffect(() => {
		let cancelled = false;
		setLoading(true);
		setErroring(null);

		getFlashSales()
			.then((data) => {
				if (cancelled) return;
				const list = Array.isArray(data) ? data : [];
				const activeList = list.filter((sale) => Number(sale?.status) === 1);
				const resolvedSale =
					(selectedSaleId != null && list.find((sale) => Number(sale?.id) === selectedSaleId)) ||
					activeList[0] ||
					list[0] ||
					null;

				setSelectedSale(resolvedSale);
			})
			.catch((err: any) => {
				if (cancelled) return;
				setErroring(err?.message || "Không tải được danh sách flash sale.");
				setLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [selectedSaleId]);

	useEffect(() => {
		let cancelled = false;

		if (!selectedSale?.id) {
			setItems([]);
			setLoading(false);
			return;
		}

		setLoading(true);
		getFlashSaleItems(Number(selectedSale.id))
			.then(async (response) => {
				if (cancelled) return;
				const hydrated = await Promise.all(
					(response ?? []).map(async (item) => {
						if (item.thumbnail) return item;
						const bookName = String(item.bookName ?? "").trim();
						if (!bookName) return item;
						try {
							const thumbnail = await layThumbnailSachTheoTenSach(bookName);
							return { ...item, thumbnail: thumbnail || item.thumbnail || "" };
						} catch {
							return item;
						}
					})
				);
				setItems(hydrated);
				setLoading(false);
			})
			.catch((err: any) => {
				if (cancelled) return;
				setErroring(err?.message || "Không tải được sản phẩm của flash sale này.");
				setLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [selectedSale?.id]);

	const saleItems = useMemo(() => {
		const nextItems = [...items];
		nextItems.sort((a, b) => {
			const discountA = calcDiscountPercent(Number(a.originalPrice ?? 0), Number(a.salePrice ?? 0));
			const discountB = calcDiscountPercent(Number(b.originalPrice ?? 0), Number(b.salePrice ?? 0));
			if (discountB !== discountA) return discountB - discountA;

			const soldA = Number(a.sold ?? 0);
			const soldB = Number(b.sold ?? 0);
			return soldB - soldA;
		});
		return nextItems;
	}, [items]);

	const totalPages = Math.max(1, Math.ceil(saleItems.length / PAGE_SIZE));
	const visibleItems = saleItems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

	useEffect(() => {
		setCurrentPage(1);
	}, [selectedSale?.id]);

	const handlePagination = (pageNumber: number) => {
		setCurrentPage(pageNumber);
		window.scrollTo(0, 0);
	};

	if (loading) {
		return (
			<div className="container my-4">
				<div className="alert alert-secondary mb-0" role="alert">
					Đang tải dữ liệu...
				</div>
			</div>
		);
	}

	if (erroring) {
		return (
			<div className="container my-4">
				<div className="alert alert-danger mb-0" role="alert">
					Gặp lỗi: {erroring}
				</div>
			</div>
		);
	}

	if (!selectedSale) {
		return (
			<div className="container my-4">
				<div className="alert alert-warning mb-0" role="alert">
					Hiện chưa có chương trình flash sale để hiển thị.
				</div>
			</div>
		);
	}

	return (
		<div className="container my-4">
			{saleItems.length === 0 ? (
				<div className="alert alert-warning mb-0" role="alert">
					Hiện chưa có sản phẩm trong chương trình flash sale này.
				</div>
			) : (
				<>
					<div className="row g-3">
						{visibleItems.map((item) => {
							const discountPercent = calcDiscountPercent(Number(item.originalPrice ?? 0), Number(item.salePrice ?? 0));
							const progressPercent = getRemainingPercent(item);

							return (
								<div className="col-12 col-sm-6 col-lg-3" key={item.id ?? `${item.flashSaleId}-${item.bookId}-${item.bookName}`}>
									<div className="card border-0 shadow-sm h-100 position-relative overflow-hidden">
										{discountPercent > 0 && (
											<div className="badge bg-danger position-absolute top-0 start-0 m-2" style={{ zIndex: 2 }}>
												-{discountPercent}%
											</div>
										)}
										<div style={{ height: 280, background: "#f8f9fa" }}>
											<img
												src={item.thumbnail || "https://via.placeholder.com/400x600?text=No+Image"}
												alt={item.bookName ?? "Flash sale item"}
												className="w-100 h-100"
												style={{ objectFit: "cover" }}
											/>
										</div>
										<div className="card-body d-flex flex-column">
											<div className="fw-semibold mb-2" style={{ minHeight: 48 }}>
												{item.bookName}
											</div>
											<div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
												<span className="text-danger fw-bold">{Number(item.salePrice ?? 0).toLocaleString("vi-VN")}đ</span>
												<span className="text-body-secondary text-decoration-line-through small">{Number(item.originalPrice ?? 0).toLocaleString("vi-VN")}đ</span>
											</div>
											<div className="small text-body-secondary mb-2">
												Đã bán: {Number(item.sold ?? 0)} / {Number(item.quantity ?? 0) + Number(item.sold ?? 0)}
											</div>
											<div className="progress mb-2" style={{ height: 8 }}>
												<div className="progress-bar bg-danger" style={{ width: `${progressPercent}%` }} />
											</div>
											<div className="small text-body-secondary mt-auto">
												Còn lại: {Math.max(0, Number(item.quantity ?? 0))} sản phẩm
											</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>

					{totalPages > 1 && (
						<>
							<hr className="mt-4" style={{ color: "#aaa" }} />
							<PhanTrang
								trangHienTai={currentPage}
								tongSoTrang={totalPages}
								phanTrang={handlePagination}
							/>
						</>
					)}
				</>
			)}
		</div>
	);
};
export default FlashSalePage;