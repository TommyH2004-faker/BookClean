
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import useScrollToTop from "../hooks/ScrollToTop";
import { getFlashSaleItems, getFlashSales } from "../api/FlashSaleApi";
import { layThumbnailSachTheoTenSach } from "../api/HinhAnhAPI";
import type { FlashSaleItemModel } from "../models/FlashSaleItemModel";
import { flashSaleStatusLabel, type FlashSaleModel } from "../models/FlashSaleModel";
import {
    Alert,
    Box,
    Card,
    CardActionArea,
    CardContent,
    CardMedia,
    Chip,
    CircularProgress,
    Divider,
    Grid,
    LinearProgress,
    Pagination,
    Stack,
    Typography,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";

const PAGE_SIZE = 16;

type FlashSaleItemViewModel = FlashSaleItemModel & {
    thumbnail?: string;
    userRemainingQuantity?: number | null;
};

function resolveImageUrl(imageUrl?: string): string {
    if (!imageUrl) return "";
    if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
    return imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
}

function calcDiscountPercent(originalPrice: number, salePrice: number): number {
    if (originalPrice > 0 && salePrice > 0 && salePrice < originalPrice) {
        return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
    }
    return 0;
}

function formatDateTime(value?: string): string {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return new Intl.DateTimeFormat("vi-VN", {
        weekday: "short",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).format(d);
}

const FlashSalePage: React.FC = () => {
    useScrollToTop();
    const [searchParams] = useSearchParams();
    const [selectedSale, setSelectedSale] = useState<FlashSaleModel | null>(null);
    const [items, setItems] = useState<FlashSaleItemViewModel[]>([]);
    const thumbnailCacheRef = useRef<Record<string, string>>({});
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
                setLoading(false);
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
        let intervalId: ReturnType<typeof setInterval> | undefined;

        if (!selectedSale?.id) {
            setItems([]);
            setLoading(false);
            return;
        }

        const loadItems = async (showSpinner: boolean) => {
            if (showSpinner) setLoading(true);

            try {
                const response = await getFlashSaleItems(Number(selectedSale.id));
                if (cancelled) return;

                const nextCache: Record<string, string> = { ...thumbnailCacheRef.current };

                const hydrated = await Promise.all(
                    (response ?? []).map(async (item: FlashSaleItemViewModel) => {
                        if (item.thumbnail) return item;

                        const bookName = String(item.bookName ?? "").trim();
                        if (!bookName) return item;

                        if (nextCache[bookName]) {
                            return { ...item, thumbnail: nextCache[bookName] };
                        }

                        try {
                            const thumbnail = await layThumbnailSachTheoTenSach(bookName);
                            if (thumbnail) nextCache[bookName] = thumbnail;
                            return { ...item, thumbnail: thumbnail || item.thumbnail || "" };
                        } catch {
                            return item;
                        }
                    })
                );

                if (cancelled) return;

                thumbnailCacheRef.current = nextCache;
                setItems(hydrated);
                if (showSpinner) setLoading(false);
            } catch (err: any) {
                if (cancelled) return;
                setErroring(err?.message || "Không tải được sản phẩm của flash sale này.");
                if (showSpinner) setLoading(false);
            }
        };

        setErroring(null);
        void loadItems(true);
        intervalId = setInterval(() => {
            void loadItems(false);
        }, 15000);

        return () => {
            cancelled = true;
            if (intervalId) clearInterval(intervalId);
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
            <Box sx={{ maxWidth: 1200, mx: "auto", px: 2, my: 4 }}>
                <Alert severity="info" action={<CircularProgress size={18} color="inherit" />}>
                    Đang tải dữ liệu...
                </Alert>
            </Box>
        );
    }

    if (erroring) {
        return (
            <Box sx={{ maxWidth: 1200, mx: "auto", px: 2, my: 4 }}>
                <Alert severity="error">Gặp lỗi: {erroring}</Alert>
            </Box>
        );
    }

    if (!selectedSale) {
        return (
            <Box sx={{ maxWidth: 1200, mx: "auto", px: 2, my: 4 }}>
                <Alert severity="warning">Hiện chưa có chương trình flash sale để hiển thị.</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 1200, mx: "auto", px: 2, my: 4 }}>
            <Card variant="outlined" sx={{ overflow: "hidden", mb: 3 }}>
                <Grid container>
                    <Grid item xs={12} md={5}>
                        <CardMedia
                            component="img"
                            height={240}
                            src={
                                resolveImageUrl(selectedSale.image) ||
                                "https://via.placeholder.com/1200x480?text=Flash+Sale"
                            }
                            alt={selectedSale.name || "Flash Sale"}
                            sx={{
                                height: { xs: 200, md: 260 },
                                width: "100%",
                                objectFit: "cover",
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={7}>
                        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
                                <Chip
                                    icon={<LocalFireDepartmentIcon />}
                                    label="Flash Sale"
                                    color="error"
                                    size="small"
                                />
                                {selectedSale.status !== undefined && selectedSale.status !== null && (
                                    <Chip
                                        label={flashSaleStatusLabel(selectedSale.status)}
                                        variant="outlined"
                                        size="small"
                                    />
                                )}
                            </Stack>

                            <Typography variant="h4" fontWeight={800} sx={{ lineHeight: 1.1, mb: 1 }}>
                                {selectedSale.name || "Flash Sale"}
                            </Typography>

                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                <AccessTimeIcon fontSize="small" color="action" />
                                <Typography variant="body1" color="text.secondary">
                                    {selectedSale.startTime || selectedSale.endTime
                                        ? `${selectedSale.startTime ? formatDateTime(selectedSale.startTime) : ""}${selectedSale.startTime && selectedSale.endTime ? "  →  " : ""}${selectedSale.endTime ? formatDateTime(selectedSale.endTime) : ""}`
                                        : ""}
                                </Typography>
                            </Stack>

                            <Divider sx={{ my: 1.5 }} />

                            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} useFlexGap>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Sản phẩm
                                    </Typography>
                                    <Typography variant="h6" fontWeight={700}>
                                        {saleItems.length}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Tự động cập nhật
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Mỗi 15 giây
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Grid>
                </Grid>
            </Card>

            {saleItems.length === 0 ? (
                <Alert severity="warning">Hiện chưa có sản phẩm trong chương trình flash sale này.</Alert>
            ) : (
                <>
                    <Grid container spacing={2}>
                        {visibleItems.map((item) => {
                            const discountPercent = calcDiscountPercent(
                                Number(item.originalPrice ?? 0),
                                Number(item.salePrice ?? 0)
                            );

                            const sold = Number(item.sold ?? 0);
                            const quantity = Number(item.quantity ?? 0);
                            const remaining = Math.max(0, quantity - sold);
                            const progressPercent =
                                quantity > 0 ? Math.min(100, Math.round((sold / quantity) * 100)) : 0;

                            const bookId = Number((item as any)?.bookId ?? (item as any)?.idBook ?? 0);
                            const maxPerUser = Number(item.maxPerUser ?? 0);

                            // Lấy nguyên bản giá trị từ Backend trả về
                            const rawUserRemaining = item.userRemainingQuantity; 
                            
                            // Kiểm tra user đã chạm nóc giới hạn mua chưa
                            const isPurchaseLimitReached = 
                                maxPerUser > 0 && 
                                rawUserRemaining != null && 
                                Number(rawUserRemaining) <= 0;

                            const isSoldOut = remaining <= 0;
                            const showSalePrice = !isSoldOut;
                            
                            const effectivePrice = showSalePrice
                                ? Number(item.salePrice ?? 0)
                                : Number(item.originalPrice ?? item.salePrice ?? 0);

                            // =====================================================================
                            // CHỐT CHẶN CONSOLE.LOG ĐỂ BẮT BỆNH:
                            // =====================================================================
                            console.log(`--- SẢN PHẨM: ${item.bookName} ---`);
                            console.log(`1. rawUserRemaining (từ BE):`, rawUserRemaining);
                            console.log(`2. maxPerUser:`, maxPerUser);
                            console.log(`3. isPurchaseLimitReached (đạt GH chưa?):`, isPurchaseLimitReached);
                            console.log(`4. isSoldOut (Kho còn ko?):`, isSoldOut);
                            console.log(`5. sold:`, sold, `/ quantity:`, quantity);
                            console.log(`-----------------------------------`);

                            return (
                                <Grid
                                    item
                                    xs={12}
                                    sm={6}
                                    md={4}
                                    lg={3}
                                    key={String(item.id ?? `${item.flashSaleId}-${item.bookId}-${item.bookName}`)}
                                >
                                    <Card
                                        variant="outlined"
                                        className={showSalePrice ? "sale-card-glow" : ""}
                                        sx={{ height: "100%", position: "relative" }}
                                    >
                                        {discountPercent > 0 && showSalePrice && (
                                            <Chip
                                                label={`-${discountPercent}%`}
                                                color="error"
                                                size="small"
                                                sx={{ position: "absolute", top: 10, left: 10, zIndex: 1 }}
                                            />
                                        )}

                                        {isSoldOut && (
                                            <Chip
                                                label="Đã bán hết"
                                                color="default"
                                                size="small"
                                                sx={{ position: "absolute", top: 10, right: 10, zIndex: 1 }}
                                            />
                                        )}

                                        {/* HIỂN THỊ CHIP GIỚI HẠN MUA */}
                                        {isPurchaseLimitReached && !isSoldOut && (
                                            <Chip
                                                label="Đã đạt giới hạn mua sale sản phẩm này rồi"
                                                color="warning"
                                                size="small"
                                                sx={{ position: "absolute", top: 10, right: 10, zIndex: 1 }}
                                            />
                                        )}

                                        <CardActionArea
                                            component={Link}
                                            to={bookId > 0 ? `/books/${bookId}` : "#"}
                                            aria-label={item.bookName ? `Xem chi tiết ${item.bookName}` : "Xem chi tiết sản phẩm"}
                                            sx={{ height: "100%", alignItems: "stretch" }}
                                        >
                                            <CardMedia
                                                component="img"
                                                height={260}
                                                src={item.thumbnail || "https://via.placeholder.com/400x600?text=No+Image"}
                                                alt={item.bookName ?? "Flash sale item"}
                                                sx={{ objectFit: "cover" }}
                                            />
                                            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1.1 }}>
                                                <Typography variant="subtitle1" fontWeight={700} sx={{ minHeight: 44 }}>
                                                    {item.bookName}
                                                </Typography>

                                                <Stack direction="row" spacing={1} alignItems="baseline" flexWrap="wrap" useFlexGap>
                                                    <Typography variant="h6" color="error" fontWeight={800}>
                                                        {effectivePrice.toLocaleString("vi-VN")}đ
                                                    </Typography>
                                                    {showSalePrice && (
                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                            sx={{ textDecoration: "line-through" }}
                                                        >
                                                            {Number(item.originalPrice ?? 0).toLocaleString("vi-VN")}đ
                                                        </Typography>
                                                    )}
                                                </Stack>

                                                <Typography variant="body2" color="text.secondary">
                                                    Đã bán: {sold} / {quantity}
                                                </Typography>

                                                {/* HIỂN THỊ DÒNG TEXT GIỚI HẠN DƯỚI CÙNG */}
                                                {maxPerUser > 0 && (
                                                    <Typography
                                                        variant="body2"
                                                        color={isPurchaseLimitReached ? "error" : "text.secondary"}
                                                    >
                                                        Giới hạn mỗi người: {maxPerUser} 
                                                        {rawUserRemaining != null 
                                                            ? ` - Còn được mua: ${rawUserRemaining}` 
                                                            : ""}
                                                    </Typography>
                                                )}

                                                <LinearProgress
                                                    variant="determinate"
                                                    value={progressPercent}
                                                    color="error"
                                                    sx={{ height: 8, borderRadius: 999 }}
                                                />

                                                <Typography variant="body2" color="text.secondary">
                                                    Còn lại: {remaining} sản phẩm
                                                </Typography>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>

                    {totalPages > 1 && (
                        <Stack alignItems="center" sx={{ mt: 4 }}>
                            <Pagination
                                count={totalPages}
                                page={currentPage}
                                onChange={(_, page) => handlePagination(page)}
                                color="standard"
                                shape="rounded"
                            />
                        </Stack>
                    )}
                </>
            )}
        </Box>
    );
};

export default FlashSalePage;