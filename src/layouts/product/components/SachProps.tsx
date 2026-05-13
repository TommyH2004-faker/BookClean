
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BookModel from "../../../models/BookModel";
import ImageModel from "../../../models/ImageModel";
import { lay1AnhCuaMotSach } from "../../../api/HinhAnhAPI";
import dinhDangSo from "../../utils/dinhDangSo";
import renderRating from "../../utils/SaoXepHang";
import { useCartItem } from "../../utils/CartItemContext";
import { getIdUserByToken, isToken } from "../../utils/JwtService";
import { endpointBE } from "../../utils/Constant";
import { toast } from "react-toastify";
import { getErrorMessage } from "../../utils/helperError";

import { getCartAllByIdUser } from "../../../api/CartApi";


interface SachPropsInterface {
    sach: BookModel;
    showSoldProgress?: boolean;
}

const SachProps: React.FC<SachPropsInterface> = ({ sach, showSoldProgress = false }) => {
    const maSach: number = sach.idBook;
    const [danhSachAnh, setDanhSachAnh] = useState<ImageModel[]>([]);
    const [dangTaiDuLieu, setDangTaiDuLieu] = useState(true);
    const [baoLoi, setBaoLoi] = useState<string | null>(null);
    const { setTotalCart, cartList, setCartList } = useCartItem();
    const [isFavoriteBook, setIsFavoriteBook] = useState(false);
    const navigation = useNavigate();

    useEffect(() => {
        lay1AnhCuaMotSach(maSach)
            .then(hinhAnhData => {
                setDanhSachAnh(hinhAnhData);
                setDangTaiDuLieu(false);
            })
            .catch(error => {
                setDangTaiDuLieu(false);
                setBaoLoi(error.message);
            });

        if (isToken()) {
            fetch(endpointBE + `/favorite-book/get-favorite-book/${getIdUserByToken()}`)
                .then(response => response.json())
                .then(data => {
                    if (data.includes(maSach)) {
                        setIsFavoriteBook(true);
                    }
                })
                .catch(error => console.log(error));
        }
    }, [maSach]);

    const handleAddProduct = async (newBook: BookModel) => {
        console.log("🟢 CLICK ADD TO CART =================");
        console.log("📦 BOOK INPUT:", newBook);
        console.log("🔥 FLASH SALE INFO:", {
            isFlashSale: newBook.isFlashSale,
            flashSalePrice: newBook.flashSalePrice,
            flashSaleItemId: newBook.flashSaleItemId,
        });
        const existingCartItem = cartList.find(
            (item) => item.book.idBook === newBook.idBook
        );

        if (!isToken() && newBook.flashSalePrice != null) {
            toast.info("Vui lòng đăng nhập để mua Flash Sale");
            return;
        }

        try {
            let updatedCart = [...cartList];

            // ================= UPDATE =================
            if (existingCartItem) {

                if (isToken()) {

                    const res = await fetch(
                        `${endpointBE}/cart-items/update-item`,
                        {
                            method: "PUT",
                            headers: {
                                Authorization:
                                    `Bearer ${localStorage.getItem("token")}`,
                                "content-type": "application/json",
                            },
                            body: JSON.stringify({
                                idCart: existingCartItem.idCart,
                                quantity: existingCartItem.quantity + 1,
                            }),
                        }
                    );

                    if (!res.ok) {
                        const message = await getErrorMessage(res);
                        toast.error(message || "Không thể cập nhật giỏ hàng");
                        return;
                    }

                    // DTO backend có thể trả nhiều shape khác nhau:
                    // - { data: { idCart, quantity, ... } }
                    // - { data: 123 }
                    // - { idCart, quantity, ... }
                    // - 123
                    let cartData: any = undefined;
                    try {
                        const payload = await res.json();
                        cartData = payload?.data ?? payload;
                    } catch {
                        cartData = undefined;
                    }

                    const resolvedQuantity =
                        typeof cartData === "object" && cartData !== null
                            ? (cartData.quantity ?? (existingCartItem.quantity + 1))
                            : (existingCartItem.quantity + 1);

                    const resolvedIdCart =
                        typeof cartData === "object" && cartData !== null
                            ? (cartData.idCart ?? cartData.id ?? existingCartItem.idCart)
                            : existingCartItem.idCart;

                    updatedCart = updatedCart.map(item =>
                        item.book.idBook === newBook.idBook
                            ? {
                                ...item,

                                idCart: resolvedIdCart,
                                quantity: resolvedQuantity,

                                totalQuantity:
                                    (typeof cartData === "object" && cartData !== null)
                                        ? (cartData.totalQuantity ?? cartData.TotalQuantity ?? resolvedQuantity)
                                        : (item.totalQuantity ?? resolvedQuantity),

                                saleQuantity:
                                    (typeof cartData === "object" && cartData !== null)
                                        ? (cartData.saleQuantity ?? cartData.SaleQuantity
                                            ?? item.saleQuantity)
                                        : item.saleQuantity,
                                normalQuantity:
                                    (typeof cartData === "object" && cartData !== null)
                                        ? (cartData.normalQuantity ?? cartData.NormalQuantity
                                            ?? item.normalQuantity)
                                        : item.normalQuantity,

                                flashSalePrice:
                                    (typeof cartData === "object" && cartData !== null)
                                        ? (cartData.flashSalePrice ?? cartData.FlashSalePrice ?? item.flashSalePrice)
                                        : item.flashSalePrice,
                                normalPrice:
                                    (typeof cartData === "object" && cartData !== null)
                                        ? (cartData.normalPrice ?? cartData.NormalPrice ?? item.normalPrice)
                                        : item.normalPrice,

                                totalItemPrice:
                                    (typeof cartData === "object" && cartData !== null)
                                        ? (cartData.totalItemPrice ?? cartData.TotalItemPrice ?? item.totalItemPrice)
                                        : item.totalItemPrice,

                                flashSaleItemId:
                                    (typeof cartData === "object" && cartData !== null)
                                        ? (cartData.flashSaleItemId ?? cartData.FlashSaleItemId ?? item.flashSaleItemId)
                                        : item.flashSaleItemId,
                            }
                            : item
                    );

                } else {

                    // guest cart
                    updatedCart = updatedCart.map(item => {
                        if (item.book.idBook !== newBook.idBook) return item;
                        const newQty = item.quantity + 1;
                        const saleQuantity = newBook.isFlashSale
                            ? newQty
                            : (item.saleQuantity ?? 0);
                        const normalQuantity = newBook.isFlashSale
                            ? 0
                            : newQty;
                        const normalPrice = item.normalPrice ?? newBook.sellPrice;
                        const flashSalePrice = newBook.isFlashSale
                            ? (item.flashSalePrice ?? newBook.flashSalePrice ?? null)
                            : (item.flashSalePrice ?? null);
                        return {
                            ...item,
                            quantity: newQty,
                            totalQuantity: newQty,
                            // Với sách flash sale, tăng saleQuantity cùng với quantity
                            saleQuantity,
                            normalQuantity,
                            normalPrice,
                            flashSalePrice,
                            totalItemPrice: newQty * normalPrice,
                            flashSaleItemId: item.flashSaleItemId ?? newBook.flashSaleItemId ?? null,
                        };
                    });
                }

            }

            // ================= CREATE =================
            else {

                if (isToken()) {

                    const res = await fetch(
                        `${endpointBE}/cart-items/add-item`,
                        {
                            method: "POST",
                            headers: {
                                Authorization:
                                    `Bearer ${localStorage.getItem("token")}`,
                                "content-type": "application/json",
                            },
                            body: JSON.stringify({
                                bookId: newBook.idBook,
                                quantity: 1,
                            }),
                        }
                    );

                    if (!res.ok) {
                        const message = await getErrorMessage(res);
                        toast.error(message || "Không thể thêm vào giỏ hàng");
                        return;
                    }

                    // DTO backend có thể trả idCart hoặc full cart item
                    let cartData: any = undefined;
                    try {
                        const payload = await res.json();
                        cartData = payload?.data ?? payload;
                    } catch {
                        cartData = undefined;
                    }

                    const resolvedIdCart =
                        typeof cartData === "number"
                            ? cartData
                            : (typeof cartData === "string"
                                ? (Number(cartData) || undefined)
                                : (cartData?.idCart ?? cartData?.id));

                    const resolvedQuantity =
                        (typeof cartData === "object" && cartData !== null)
                            ? (cartData.quantity ?? 1)
                            : 1;

                    updatedCart.push({
                        idCart: resolvedIdCart,

                        quantity: resolvedQuantity,

                        totalQuantity:
                            (typeof cartData === "object" && cartData !== null)
                                ? (cartData.totalQuantity ?? cartData.TotalQuantity ?? resolvedQuantity)
                                : resolvedQuantity,

                        saleQuantity:
                            (typeof cartData === "object" && cartData !== null)
                                // Fallback: nếu BE không trả saleQuantity, với flash sale thì toàn bộ 1 quyển đầu là giá sale
                                ? (cartData.saleQuantity ?? cartData.SaleQuantity ?? (newBook.isFlashSale ? resolvedQuantity : 0))
                                : (newBook.isFlashSale ? resolvedQuantity : 0),
                        normalQuantity:
                            (typeof cartData === "object" && cartData !== null)
                                ? (cartData.normalQuantity ?? cartData.NormalQuantity ?? (newBook.isFlashSale ? 0 : resolvedQuantity))
                                : (newBook.isFlashSale ? 0 : resolvedQuantity),

                        flashSalePrice:
                            (typeof cartData === "object" && cartData !== null)
                                ? (cartData.flashSalePrice ?? cartData.FlashSalePrice
                                    ?? (newBook.isFlashSale ? newBook.flashSalePrice : null))
                                : (newBook.isFlashSale ? newBook.flashSalePrice : null),
                        normalPrice:
                            (typeof cartData === "object" && cartData !== null)
                                ? (cartData.normalPrice ?? cartData.NormalPrice ?? newBook.sellPrice)
                                : newBook.sellPrice,

                        totalItemPrice:
                            (typeof cartData === "object" && cartData !== null)
                                ? (cartData.totalItemPrice ?? cartData.TotalItemPrice)
                                : undefined,

                        flashSaleItemId:
                            (typeof cartData === "object" && cartData !== null)
                                ? (cartData.flashSaleItemId ?? cartData.FlashSaleItemId ?? newBook.flashSaleItemId ?? null)
                                : (newBook.flashSaleItemId ?? null),

                        book: newBook,
                    });

                } else {

                    updatedCart.push({
                        quantity: 1,
                        totalQuantity: 1,
                        saleQuantity: 0,
                        normalQuantity: 1,
                        flashSalePrice: null,
                        normalPrice: newBook.sellPrice,
                        totalItemPrice: newBook.sellPrice,
                        flashSaleItemId: newBook.flashSaleItemId ?? null,
                        book: newBook,
                    });
                }
            }

            // ================= SAVE =================
            setCartList(updatedCart);

            localStorage.setItem(
                "cart",
                JSON.stringify(updatedCart)
            );

            const total = updatedCart.reduce(
                (sum, item) => sum + item.quantity,
                0
            );

            setTotalCart(total);

            toast.success("Thêm vào giỏ hàng thành công");

            // Re-fetch cart từ BE để lấy đúng split sale/normal (BE biết quota)
            if (isToken()) {
                try {
                    const freshCart = await getCartAllByIdUser();
                    localStorage.setItem("cart", JSON.stringify(freshCart));
                    setCartList([...freshCart]);
                    setTotalCart(freshCart.reduce((s, i) => s + i.quantity, 0));
                } catch { /* giữ fallback data */ }
            }

        } catch {
            toast.error("Lỗi kết nối server");
        }
    };
    const handleFavoriteBook = async () => {
        if (!isToken()) {
            toast.info("Bạn phải đăng nhập để sử dụng chức năng này");
            navigation("/dangnhap");
            return;
        }

        const token = localStorage.getItem("token");
        const isRemoving = isFavoriteBook;
        const url = isRemoving ? `${endpointBE}/favorite-book/delete-book` : `${endpointBE}/favorite-book/add-book`;

        try {
            const response = await fetch(url, {
                method: isRemoving ? "DELETE" : "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ bookId: maSach }),
            });

            if (!response.ok) throw new Error("Lỗi khi xử lý favorite");

            setIsFavoriteBook(!isFavoriteBook);
            toast.success(isRemoving ? "Đã xóa khỏi danh sách yêu thích" : "Thêm vào yêu thích thành công");
        } catch (err) {
            toast.error("Có lỗi xảy ra, vui lòng thử lại");
        }
    };

    if (dangTaiDuLieu) return <h1>Đang tải dữ liệu...</h1>;
    if (baoLoi) return <h1>Gặp lỗi: {baoLoi}</h1>;

    // If BE returns both sellPrice (normal) and flashSalePrice (sale), prefer flashSalePrice for display.
    const displayPrice =
        sach.flashSalePrice != null
            ? sach.flashSalePrice
            : sach.sellPrice;

    const duLieuAnh = danhSachAnh.length > 0 ? danhSachAnh[0].url : "";
    const listPrice = sach.listPrice ?? 0;
    const discountPercent = listPrice > 0 && displayPrice > 0 && displayPrice < listPrice
        ? Math.round(((listPrice - displayPrice) / listPrice) * 100) : 0;

    const isFlashSale =
        sach.flashSalePrice != null &&
        sach.flashSaleItemId != null;
    const soldQuantity = sach.soldQuantity ?? 0;
    const stockQuantity = sach.quantity ?? 0;
    const totalForProgress = soldQuantity + stockQuantity;
    const soldPercent = totalForProgress > 0 ? Math.round((soldQuantity / totalForProgress) * 100) : 0;

    return (
        <div className="col-md-3 mt-2">
            <div className="card border-0 shadow-4 rounded h-100 bg-white" style={{ position: "relative", overflow: "hidden" }}>
                {discountPercent > 0 && (
                    <div className="badge bg-danger" style={{ position: "absolute", top: "10px", left: "10px", padding: "8px 10px", fontSize: "0.85rem", zIndex: 2 }}>
                        -{discountPercent}%
                    </div>
                )}

                <Link to={`/books/${sach.idBook}`} className="d-block text-decoration-none">
                    <div style={{ height: "290px", background: "#f8f9fa" }}>
                        <img src={duLieuAnh} alt={sach.nameBook} className="w-100 h-100" style={{ objectFit: "cover" }} />
                    </div>
                </Link>

                <div className="card-body p-3 d-flex flex-column">
                    <Link to={`/books/${sach.idBook}`} className="text-decoration-none text-dark">
                        <div className={`fw-semibold ${isFlashSale ? "blinking-text-flash-sale" : ""}`}
                            style={{ minHeight: "44px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                        >
                            {sach.nameBook}
                        </div>
                    </Link>

                    <div className="mt-2">
                        <span className="discounted-price text-danger me-2">
                            <strong style={{ fontSize: "18px" }}>{dinhDangSo(displayPrice)}đ</strong>
                        </span>
                        <span className="original-price small text-muted"><del>{dinhDangSo(sach.listPrice)}đ</del></span>
                    </div>

                    {showSoldProgress && (
                        <div className="mt-2">
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="small text-body-secondary">Đã bán {soldQuantity}</span>
                                {totalForProgress > 0 && <span className="small text-body-secondary">{soldPercent}%</span>}
                            </div>
                            {totalForProgress > 0 && (
                                <div className="progress" style={{ height: 8 }}>
                                    <div className="progress-bar bg-danger" role="progressbar" style={{ width: `${Math.min(100, Math.max(0, soldPercent))}%` }} aria-valuenow={soldPercent} aria-valuemin={0} aria-valuemax={100}></div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="mt-2 d-flex align-items-center justify-content-between mt-auto pt-2">
                        <div>{renderRating(sach.avgRating || 0)}</div>
                        <div className="d-flex gap-2" role="group" aria-label="Thao tác sản phẩm">
                            <button type="button" className={`btn btn-sm ${isFavoriteBook ? "btn-danger" : "btn-outline-danger"}`} onClick={handleFavoriteBook} title="Yêu thích">
                                <i className="fas fa-heart"></i>
                            </button>
                            <button type="button" className="btn btn-danger btn-sm" onClick={() => handleAddProduct(sach)} title="Thêm vào giỏ">
                                <i className="fas fa-shopping-cart"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SachProps;