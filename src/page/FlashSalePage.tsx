import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import useScrollToTop from "../hooks/ScrollToTop";
import { getAllBook } from "../api/SachAPI";
import BookModel from "../models/BookModel";
import SachProps from "../layouts/product/components/SachProps";
import { PhanTrang } from "../layouts/utils/PhanTrang";
import {
	FLASH_SALE_SLOT_HOURS,
	formatSlotLabel,
	getFlashSaleSlotIndex,
	getNextFlashSaleSlotHour,
	parseFlashSaleSlotParam,
	type FlashSaleSlotHour,
} from "../layouts/utils/flashSale";

type SlotPhase = "upcoming" | "active" | "ended";

function calcDiscountPercent(book: BookModel): number {
	const listPrice = book.listPrice ?? 0;
	const sellPrice = book.sellPrice ?? 0;
	const explicit = book.discountPercent ?? 0;
	if (explicit > 0) return explicit;
	if (listPrice > 0 && sellPrice > 0 && sellPrice < listPrice) {
		return Math.round(((listPrice - sellPrice) / listPrice) * 100);
	}
	return 0;
}

function isOnSale(book: BookModel): boolean {
	return calcDiscountPercent(book) > 0;
}

function rotate<T>(items: T[], offset: number): T[] {
	if (items.length === 0) return items;
	const normalized = ((offset % items.length) + items.length) % items.length;
	if (normalized === 0) return items;
	return items.slice(normalized).concat(items.slice(0, normalized));
}

function pad2(value: number): string {
	return value.toString().padStart(2, "0");
}

function getSlotWindow(now: Date, slotHour: FlashSaleSlotHour): { phase: SlotPhase; start: Date; end: Date } {
	// We treat each slot as [start, nextSlotStart)
	const nextHour = getNextFlashSaleSlotHour(slotHour);

	const todayStart = new Date(now);
	todayStart.setHours(slotHour, 0, 0, 0);

	const todayEnd = new Date(now);
	// end might be tomorrow if wrapping from 21 -> 00
	if (nextHour > slotHour) {
		todayEnd.setHours(nextHour, 0, 0, 0);
	} else {
		todayEnd.setHours(nextHour, 0, 0, 0);
		todayEnd.setDate(todayEnd.getDate() + 1);
	}

	// If the whole window is in the past, shift to next occurrence
	if (now >= todayEnd) {
		const nextStart = new Date(todayStart);
		nextStart.setDate(nextStart.getDate() + 1);

		const nextEnd = new Date(todayEnd);
		nextEnd.setDate(nextEnd.getDate() + 1);

		return { phase: "ended", start: nextStart, end: nextEnd };
	}

	if (now < todayStart) {
		return { phase: "upcoming", start: todayStart, end: todayEnd };
	}

	return { phase: "active", start: todayStart, end: todayEnd };
}

const PAGE_SIZE = 16;

const FlashSalePage: React.FC = () => {
	useScrollToTop();

	const [searchParams, setSearchParams] = useSearchParams();
	const [selectedSlotHour, setSelectedSlotHour] = useState<FlashSaleSlotHour>(() =>
		parseFlashSaleSlotParam(searchParams.get("slot"))
	);

	const [allBooks, setAllBooks] = useState<BookModel[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [erroring, setErroring] = useState<string | null>(null);

	const [nowMs, setNowMs] = useState<number>(() => Date.now());
	const [currentPage, setCurrentPage] = useState<number>(1);

	// Keep selected slot in sync with URL (?slot=...)
	useEffect(() => {
		const slotFromUrl = parseFlashSaleSlotParam(searchParams.get("slot"));
		setSelectedSlotHour(slotFromUrl);
	}, [searchParams]);

	// Tick countdown
	useEffect(() => {
		const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
		return () => window.clearInterval(timer);
	}, []);

	// Reset pagination when slot changes
	useEffect(() => {
		setCurrentPage(1);
	}, [selectedSlotHour]);

	// Load books once; Flash Sale is derived client-side
	useEffect(() => {
		let cancelled = false;
		setLoading(true);
		setErroring(null);

		getAllBook(200, 0)
			.then((response) => {
				if (cancelled) return;
				setAllBooks(response.ketQua);
				setLoading(false);
			})
			.catch((err: any) => {
				if (cancelled) return;
				setErroring(err?.message || "Không tải được danh sách sách.");
				setLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, []);

	const saleBooks = useMemo(() => {
		const filtered = allBooks.filter(isOnSale);

		filtered.sort((a, b) => {
			const da = calcDiscountPercent(a);
			const db = calcDiscountPercent(b);
			if (db !== da) return db - da;

			const sa = a.soldQuantity ?? 0;
			const sb = b.soldQuantity ?? 0;
			return sb - sa;
		});

		// Make each time slot feel different without requiring backend support
		const slotIndex = getFlashSaleSlotIndex(selectedSlotHour);
		return rotate(filtered, slotIndex * 5);
	}, [allBooks, selectedSlotHour]);

	const totalPages = Math.max(1, Math.ceil(saleBooks.length / PAGE_SIZE));
	const visibleBooks = saleBooks.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

	const now = useMemo(() => new Date(nowMs), [nowMs]);
	const slotWindow = useMemo(() => getSlotWindow(now, selectedSlotHour), [now, selectedSlotHour]);

	const countdownTarget = slotWindow.phase === "upcoming" ? slotWindow.start : slotWindow.end;
	const countdownLabel = slotWindow.phase === "upcoming" ? "Bắt đầu sau" : "Kết thúc sau";
	const remainingMs = Math.max(0, countdownTarget.getTime() - now.getTime());
	const remainingSec = Math.floor(remainingMs / 1000);
	const hh = Math.floor(remainingSec / 3600);
	const mm = Math.floor((remainingSec % 3600) / 60);
	const ss = remainingSec % 60;

	const handleSelectSlot = (hour: FlashSaleSlotHour) => {
		setSearchParams({ slot: hour.toString() });
		setSelectedSlotHour(hour);
	};

	const handlePagination = (pageNumber: number) => {
		setCurrentPage(pageNumber);
		window.scrollTo(0, 0);
	};

	if (loading) {
		return (
			<div className="container my-4">
				<div className="bg-light rounded p-4">
					<h3 className="mb-0">Flash Sale</h3>
					<p className="text-body-secondary mb-0">Đang tải dữ liệu...</p>
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

	return (
		<div className="container my-4">
			<div className="bg-light rounded p-4">
				<div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
					<div>
						<h3 className="mb-1 text-danger">
							<i className="fas fa-bolt me-2" aria-hidden="true"></i>
							FLASH SALE
						</h3>
						<div className="text-body-secondary small">
							Ưu đãi theo khung giờ • Giảm càng nhiều càng hot
						</div>
					</div>
					<div className="d-flex align-items-center gap-2">
						<span className="text-body-secondary small">{countdownLabel}:</span>
						<span className="badge bg-danger" style={{ fontSize: 14 }}>
							{pad2(hh)}:{pad2(mm)}:{pad2(ss)}
						</span>
					</div>
				</div>

				<hr className="my-3" />

				<div className="d-flex flex-wrap gap-2">
					{FLASH_SALE_SLOT_HOURS.map((hour) => {
						const isActive = hour === selectedSlotHour;
						return (
							<button
								key={hour}
								type="button"
								className={`btn btn-sm ${isActive ? "btn-danger" : "btn-outline-danger"}`}
								onClick={() => handleSelectSlot(hour)}
							>
								{formatSlotLabel(hour)}
							</button>
						);
					})}
				</div>

				<div className="mt-3">
					{saleBooks.length === 0 ? (
						<div className="alert alert-warning mb-0" role="alert">
							Hiện chưa có sản phẩm giảm giá để hiển thị.
						</div>
					) : (
						<>
							<div className="row">
								{visibleBooks.map((book) => (
									<SachProps key={book.idBook} sach={book} showSoldProgress />
								))}
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
			</div>
		</div>
	);
};

export default FlashSalePage;
