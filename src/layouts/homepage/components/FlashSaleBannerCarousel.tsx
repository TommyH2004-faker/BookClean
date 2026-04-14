import React from "react";
import { Link } from "react-router-dom";
import {
	FLASH_SALE_SLOT_HOURS,
	formatSlotLabel,
	getActiveFlashSaleSlotHour,
	type FlashSaleSlotHour,
} from "../../utils/flashSale";

type FlashSaleBanner = {
	slotHour: FlashSaleSlotHour;
	imageSrc: string;
	heading: string;
	subtitle: string;
};

const FlashSaleBannerCarousel: React.FC = () => {
	const activeSlot = getActiveFlashSaleSlotHour();

	const banners: FlashSaleBanner[] = [
		{
			slotHour: 0,
			imageSrc: "/images/books/banner-1.jpg",
			heading: "FLASH SALE 0H",
			subtitle: "Deal nửa đêm • Số lượng có hạn",
		},
		{
			slotHour: 12,
			imageSrc: "/images/books/banner-2.jpg",
			heading: "FLASH SALE 12H",
			subtitle: "Giờ vàng trưa • Giảm sâu mỗi ngày",
		},
		{
			slotHour: 18,
			imageSrc: "/images/books/banner-3.jpg",
			heading: "FLASH SALE 18H",
			subtitle: "Deal tan tầm • Săn ngay kẻo lỡ",
		},
		{
			slotHour: 21,
			imageSrc: "/images/books/LogoPage.jpg",
			heading: "FLASH SALE 21H",
			subtitle: "Deal buổi tối • Mua nhanh chốt lẹ",
		},
	];

	const initialIndex = Math.max(
		0,
		banners.findIndex((b) => b.slotHour === activeSlot)
	);

	return (
		<div className="container my-3">
			<div className="bg-light rounded p-3">
				<div className="d-flex justify-content-between align-items-center mb-2">
					<h5 className="mb-0 text-danger">
						<i className="fas fa-bolt me-2" aria-hidden="true"></i>
						Flash Sale hôm nay
					</h5>
					<div className="small text-body-secondary">
						{FLASH_SALE_SLOT_HOURS.map((h) => formatSlotLabel(h)).join(" • ")}
					</div>
				</div>

				<div
					id="flashSaleBannerCarousel"
					className="carousel slide"
					data-bs-ride="carousel"
					data-bs-interval="3500"
				>
					<div className="carousel-indicators">
						{banners.map((_, idx) => (
							<button
								key={idx}
								type="button"
								data-bs-target="#flashSaleBannerCarousel"
								data-bs-slide-to={idx}
								className={idx === initialIndex ? "active" : ""}
								aria-current={idx === initialIndex ? "true" : undefined}
								aria-label={`Slide ${idx + 1}`}
							></button>
						))}
					</div>

					<div className="carousel-inner rounded">
						{banners.map((banner, idx) => (
							<div
								key={banner.slotHour}
								className={`carousel-item ${idx === initialIndex ? "active" : ""}`}
								data-bs-interval="3500"
							>
								<Link
									to={`/flash-sale?slot=${banner.slotHour}`}
									className="d-block text-decoration-none"
									style={{ cursor: "pointer" }}
								>
									<img
										src={banner.imageSrc}
										className="d-block w-100"
										alt={`Flash Sale ${formatSlotLabel(banner.slotHour)}`}
										style={{ maxHeight: 260, objectFit: "cover" }}
									/>
									<div className="carousel-caption d-none d-md-block">
										<div className="bg-dark bg-opacity-50 rounded p-2">
											<div className="fw-semibold">{banner.heading}</div>
											<div className="small">{banner.subtitle}</div>
											<div className="small mt-1">
												Khung giờ: <strong>{formatSlotLabel(banner.slotHour)}</strong>
										</div>
										</div>
									</div>
								</Link>
							</div>
						))}
					</div>

					<button
						className="carousel-control-prev"
						type="button"
						data-bs-target="#flashSaleBannerCarousel"
						data-bs-slide="prev"
					>
						<span className="carousel-control-prev-icon" aria-hidden="true"></span>
						<span className="visually-hidden">Previous</span>
					</button>
					<button
						className="carousel-control-next"
						type="button"
						data-bs-target="#flashSaleBannerCarousel"
						data-bs-slide="next"
					>
						<span className="carousel-control-next-icon" aria-hidden="true"></span>
						<span className="visually-hidden">Next</span>
					</button>
				</div>
			</div>
		</div>
	);
};

export default FlashSaleBannerCarousel;
