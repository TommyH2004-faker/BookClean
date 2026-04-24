import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getFlashSales } from "../../../api/FlashSaleApi";
import type { FlashSaleModel } from "../../../models/FlashSaleModel";
import { FlashSaleStatus } from "../../../models/FlashSaleModel";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

function resolveImageUrl(imageUrl?: string): string {
	if (!imageUrl) return "";
	if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
	return imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
}

const FlashSaleBannerCarousel: React.FC = () => {
	const [flashSales, setFlashSales] = useState<FlashSaleModel[]>([]);

	useEffect(() => {
		let cancelled = false;

		getFlashSales()
			.then((data) => {
				if (cancelled) return;
				setFlashSales(Array.isArray(data) ? data : []);
			})
			.catch(() => {
				if (cancelled) return;
				setFlashSales([]);
			});

		return () => {
			cancelled = true;
		};
	}, []);

	const banners = useMemo(() => {
		const activeSales = flashSales.filter((sale) => Number(sale?.status) === FlashSaleStatus.Active);
		const source = activeSales.length > 0 ? activeSales : flashSales;

		return source.map((sale, index) => ({
			id: sale.id ?? index,
			name: sale.name || "Flash Sale",
			imageSrc: resolveImageUrl(sale.image) || "",
			subtitle:
				sale.startTime || sale.endTime
					? `Từ ${sale.startTime ? new Date(sale.startTime).toLocaleDateString("vi-VN") : ""}${sale.startTime && sale.endTime ? " - " : ""}${sale.endTime ? new Date(sale.endTime).toLocaleDateString("vi-VN") : ""}`
					: "Chương trình ưu đãi đang diễn ra",
			saleId: sale.id,
		}));
	}, [flashSales]);

	return (
		<div className="mb-3">
			<div className="bg-light">
				<div className="container-fluid py-3">
					<div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-2">
						<h5 className="mb-0 text-danger">
							<i className="fas fa-bolt me-2" aria-hidden="true"></i>
							Flash Sale hôm nay
						</h5>
						<div className="small text-body-secondary">
							{banners.length > 0 ? "Chọn một chương trình để xem sản phẩm" : "Chương trình ưu đãi đang diễn ra"}
						</div>
					</div>

					{banners.length === 0 ? (
						<div className="p-4 rounded-3 bg-white text-center text-body-secondary">
							Hiện chưa có flash sale nào đang hoạt động.
						</div>
					) : (
						<Swiper
							modules={[Autoplay, Navigation, Pagination]}
							slidesPerView={1}
							spaceBetween={16}
							loop={banners.length > 1}
							autoplay={{ delay: 4200, disableOnInteraction: false }}
							navigation
							pagination={{ clickable: true }}
							className="flash-sale-swiper"
							style={{ borderRadius: 18, overflow: "hidden" }}
						>
							{banners.map((banner) => (
								<SwiperSlide key={String(banner.id)}>
									<Link
										to={`/flash-sale?saleId=${banner.saleId ?? ""}`}
										className="d-block position-relative text-decoration-none"
										style={{ cursor: "pointer" }}
									>
										<div style={{ position: "relative", minHeight: 280, height: "clamp(260px, 30vw, 520px)" }}>
											<img
												src={banner.imageSrc || "https://via.placeholder.com/1200x480?text=Flash+Sale"}
												className="d-block w-100 h-100"
												alt={banner.name}
												loading="lazy"
												style={{ objectFit: "cover" }}
											/>
											<div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: "linear-gradient(90deg, rgba(0,0,0,.70) 0%, rgba(0,0,0,.35) 45%, rgba(0,0,0,.08) 100%)" }} />
											<div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-end align-items-md-center p-3 p-md-4">
												<div className="text-white" style={{ maxWidth: 760 }}>
													<div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
														<span className="badge bg-danger">Flash Sale</span>
														<span className="badge bg-dark bg-opacity-50">{banner.subtitle}</span>
													</div>
													<h2 className="mb-2 fw-bold" style={{ textShadow: "0 2px 12px rgba(0,0,0,.35)", lineHeight: 1.05 }}>
														{banner.name}
													</h2>
													<div className="small opacity-75">Bấm để xem sản phẩm đang nằm trong chương trình này</div>
												</div>
											</div>
										</div>
									</Link>
								</SwiperSlide>
							))}
						</Swiper>
					)}
				</div>
			</div>
		</div>
	);
};

export default FlashSaleBannerCarousel;
